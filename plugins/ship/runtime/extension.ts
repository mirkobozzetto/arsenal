import type { ExtensionAPI } from '@oh-my-pi/pi-coding-agent';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { bridgeOnly, newRun, scopedPath, transition } from './controller.mjs';

const runtime = dirname(fileURLToPath(import.meta.url));
const storage = join(homedir(), '.omp', 'agent', 'arsenal-runtime');
const quote = (value: string) => `'${value.replaceAll("'", "'\\''")}'`;
const readTools: Record<string, true> = { read: true, grep: true, glob: true, ask: true, todo: true, web_search: true, arsenal_status: true, arsenal_finish: true };
const webTools: Record<string, true> = { mcp__exa_web_search_exa: true, mcp__exa_web_search_advanced_exa: true, mcp__exa_get_code_context_exa: true, mcp__exa_crawling_exa: true };
const readLsp: Record<string, true> = { status: true, capabilities: true, diagnostics: true, definition: true, references: true, hover: true, symbols: true, type_definition: true, implementation: true };

type Run = { root: string; verification: string; phase: string; revision: number; evidence: { command: string; revision: number; exitCode: number } | null; failures: number };
type Pending = { result: string; verification: boolean; revision: number };

export default function arsenalRuntime(pi: ExtensionAPI) {
  const z = pi.zod;
  let run: Run | null = null;
  let file = '';
  let pending: Pending[] = [];
  let queue = Promise.resolve();
  const serialized = <T>(fn: () => Promise<T>): Promise<T> => {
    const result = queue.then(fn);
    queue = result.then(() => {}, () => {});
    return result;
  };
  function save() {
    if (!file) return;
    writeFileSync(`${file}.tmp`, JSON.stringify({ run, pending }));
    renameSync(`${file}.tmp`, file);
  }
  async function settle() {
    for (const job of [...pending]) {
      if (!existsSync(job.result)) continue;
      const result = JSON.parse(readFileSync(job.result, 'utf8'));
      if (run && job.verification && job.revision === run.revision) {
        run = await transition(run, { type: 'verified', command: result.command, exitCode: result.exitCode });
      }
      pending = pending.filter(item => item !== job);
    }
    save();
  }
  function protectedPath(path: string) {
    if (path === runtime || path.startsWith(`${runtime}/`) || path === storage || path.startsWith(`${storage}/`)) throw new Error('The running policy and its state cannot be edited by the controlled worker.');
    return path;
  }
  async function change() {
    if (!run) return;
    if (pending.length) throw new Error('A workspace command is still pending. Inspect its existing job before making changes.');
    if (run.failures >= 3) throw new Error('Three checks failed. User intervention is required; do not retry automatically.');
    run = await transition(run, { type: 'change' });
    save();
  }
  const result = (value: unknown) => ({ content: [{ type: 'text' as const, text: JSON.stringify(value) }], details: {} });

  pi.on('session_start', async (_event, ctx) => {
    mkdirSync(storage, { recursive: true });
    const session = ctx.sessionManager.getSessionId();
    file = join(storage, `${session}.json`);
    if (existsSync(file)) {
      const saved = JSON.parse(readFileSync(file, 'utf8'));
      run = saved.run;
      pending = saved.pending ?? [];
      await settle();
    } else {
      run = null;
      save();
    }
  });

  pi.registerCommand('arsenal-mode', {
    description: 'Controlled workflow: runtime [root], edit-only [root], status, or off. No model call.',
    getArgumentCompletions: prefix => ['runtime', 'edit-only', 'status', 'off']
      .filter(value => value.startsWith(prefix))
      .map(value => ({ value, label: value })),
    handler: async (args, ctx) => serialized(async () => {
      await settle();
      const tokens = args.trim().split(/\s+/).filter(Boolean);
      if (!tokens.length) {
        const choices = [
          'runtime - code changes with execution checks',
          'edit-only - prose and configuration changes',
          'status - show the active mode',
          'off - disable controlled mode',
        ];
        const selected = await ctx.ui.select('Choose Arsenal mode', choices);
        if (!selected) return;
        tokens.push(selected.split(' ', 1)[0]);
      }
      const [mode, ...parts] = tokens;
      if (mode === 'status') { ctx.ui.notify(JSON.stringify({ run, pending }), 'info'); return; }
      if (pending.length) throw new Error('A command is pending; recover or await it before changing mode.');
      if (mode === 'off') { run = null; save(); ctx.ui.notify('Controlled mode disabled explicitly. Native OMP permissions apply.', 'warning'); return; }
      run = newRun(resolve(ctx.cwd, parts.join(' ') || '.'), mode);
      save();
      ctx.ui.notify(`Arsenal controlled mode: ${mode}; root: ${run.root}. Eval is tool-bridge-only; shell has no network.`, 'info');
    }),
  });

  for (const skill of ['ship', 'brief', 'propose', 'arsenal', 'next', 'trace', 'issue', 'websearch']) {
    pi.registerCommand(skill, {
      description: `Run ${skill} with the Arsenal controller.`,
      handler: async (args, ctx) => serialized(async () => {
        await settle();
        if (pending.length) throw new Error('A command is still running. Inspect the existing job first.');
        if (!run || run.phase === 'done' || run.verification !== (skill === 'ship' ? 'runtime' : 'edit-only')) run = newRun(run?.root ?? ctx.cwd, skill === 'ship' ? 'runtime' : 'edit-only');
        save();
        pi.sendUserMessage(`Execute the ${skill} skill for this request: ${args}\nRead skill://${skill}. Arsenal controlled mode is active. Use only native tools through literal JavaScript tool-bridge calls. Do not use agent(), completion(), workpool(), raw Eval, browser execution, or shell networking. Use bash verification:true for the relevant final runtime check; call arsenal_finish only after the requested work is complete.`, { deliverAs: 'followUp' });
      }),
    });
  }

  pi.registerTool({
    name: 'arsenal_status', label: 'Arsenal status', description: 'Read the canonical workflow state and reconcile completed commands.',
    parameters: z.object({}), loadMode: 'essential',
    execute: async () => serialized(async () => { await settle(); return result({ active: run !== null, run, pending }); }),
  });
  pi.registerTool({
    name: 'arsenal_finish', label: 'Finish Arsenal workflow', description: 'Finish only when the current revision has the required execution evidence. This does not assert semantic correctness beyond that evidence.',
    parameters: z.object({}), loadMode: 'essential',
    execute: async () => serialized(async () => {
      await settle();
      if (!run) throw new Error('No controlled run is active.');
      if (pending.length) throw new Error('A command is still running.');
      run = await transition(run, { type: 'finish' });
      save();
      return result(run);
    }),
  });

  pi.registerTool({
    name: 'bash', label: 'Controlled shell',
    description: 'Run a workspace command. Controlled mode fixes cwd, serializes commands, prevents shell network access and writes outside the workspace/scratch. Set verification:true only for a meaningful check of the requested behavior. A repeated successful check at the same revision is reused.',
    parameters: z.object({ command: z.string(), timeout: z.number().optional(), verification: z.boolean().optional() }),
    execute: async (_id, params, signal, onUpdate, ctx) => {
      const prepared = await serialized(async () => {
        await settle();
        if (!run) return { command: params.command, cwd: ctx.cwd };
        if (params.verification && run.evidence?.revision === run.revision && run.evidence.command === params.command) return { cached: true };
        await change();
        const resultFile = join(storage, `${randomUUID()}.result.json`);
        pending.push({ result: resultFile, verification: params.verification === true, revision: run.revision });
        save();
        return { command: ['node', join(runtime, 'runner.mjs'), run.root, resultFile, params.command, String(params.timeout ?? 1800)].map(quote).join(' '), cwd: run.root, resultFile };
      });
      if ('cached' in prepared) return result({ cached: true, evidence: run?.evidence });
      if (!ctx.invokeTool) throw new Error('Native bash delegation is unavailable; refusing fallback execution.');
      try {
        return await ctx.invokeTool({ command: prepared.command, cwd: prepared.cwd, timeout: (params.timeout ?? 1800) + 5 }, { signal, onUpdate });
      } finally {
        await serialized(async () => {
          await settle();
          // A missing result remains pending: a timeout is not proof of process exit.
        });
      }
    },
  });

  pi.on('tool_call', async (event, ctx) => serialized(async () => {
    if (!run) return;
    await settle();
    const input = event.input as Record<string, unknown>;
    const name = event.toolName;
    try {
      if (name === 'eval') { bridgeOnly(input.code, input.language); return; }
      if (name === "bash" || Object.hasOwn(readTools, name) || Object.hasOwn(webTools, name)) return;
      if (name === "lsp" && Object.hasOwn(readLsp, String(input.action))) return;
      if (name === 'task') {
        if (!ctx.hasUI) throw new Error('Delegation requires an interactive user approval.');
        const tasks = Array.isArray(input.tasks) ? input.tasks : [input];
        if (tasks.length > 3) throw new Error('At most three explicitly approved agents per batch.');
        const approved = await ctx.ui.confirm('Arsenal delegation', `Allow ${tasks.length} agent(s) for exactly this request?\n${JSON.stringify(input)}`);
        if (!approved) throw new Error('User declined delegation. Continue solo.');
        return;
      }
      if (name === 'write' || name === 'edit' || name === 'ast_edit') {
        const paths = name === 'write' ? [input.path] : name === 'ast_edit' ? input.paths : [...String(input.input ?? '').matchAll(/^\[([^\]\n]+)#[A-Fa-f0-9]+\]/gm)].map(match => match[1]);
        if (!Array.isArray(paths) || !paths.length) throw new Error('Cannot determine the edit targets; refusing the write.');
        const resolved = paths.map(path => protectedPath(scopedPath(run.root, path)));
        await change();
        if (name === "write") return { input: { ...input, path: resolved[0] } };
        if (name === "ast_edit") return { input: { ...input, paths: resolved } };
        let index = 0;
        return { input: { ...input, input: String(input.input).replace(/^\[([^\]\n]+)#[A-Fa-f0-9]+\]/gm, anchor => anchor.replace(String(paths[index]), resolved[index++])) } };
      }
      throw new Error(`Tool ${name} is not available in controlled mode. Unrestricted code execution and undeclared external actions are refused.`);
    } catch (error) {
      return { block: true, reason: error instanceof Error ? error.message : String(error) };
    }
  }));
}
