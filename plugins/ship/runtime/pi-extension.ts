import type { ExtensionAPI } from '@earendil-works/pi-coding-agent';
import { Type } from 'typebox';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { newRun, scopedPath, transition } from './controller.mjs';

const runtime = dirname(fileURLToPath(import.meta.url));
const storage = join(homedir(), '.pi', 'agent', 'arsenal-runtime');
const controlledTools = ['read', 'write', 'edit', 'arsenal_run', 'arsenal_status', 'arsenal_finish'];

type Run = {
  root: string;
  verification: string;
  phase: string;
  revision: number;
  evidence: { command: string; revision: number; exitCode: number } | null;
  failures: number;
};
type Pending = { result: string; verification: boolean; revision: number };

export default function arsenalRuntime(pi: ExtensionAPI) {
  let run: Run | null = null;
  let file = '';
  let pending: Pending[] = [];
  let nativeTools: string[] = [];
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
      const commandResult = JSON.parse(readFileSync(job.result, 'utf8'));
      if (run && job.verification && job.revision === run.revision) {
        run = await transition(run, {
          type: 'verified',
          command: commandResult.command,
          exitCode: commandResult.exitCode,
        });
      }
      pending = pending.filter(item => item !== job);
    }
    save();
  }

  async function change() {
    if (!run) return;
    if (pending.length) throw new Error('A workspace command is still pending.');
    if (run.failures >= 3) throw new Error('Three checks failed. User intervention is required.');
    run = await transition(run, { type: 'change' });
    save();
  }

  function activateTools() {
    pi.setActiveTools(controlledTools.filter(name => pi.getAllTools().some(tool => tool.name === name)));
  }

  pi.on('session_start', async (_event, ctx) => {
    mkdirSync(storage, { recursive: true });
    nativeTools = pi.getActiveTools().filter(name => !name.startsWith('arsenal_'));
    file = join(storage, `${ctx.sessionManager.getSessionId()}.json`);
    if (existsSync(file)) {
      const saved = JSON.parse(readFileSync(file, 'utf8'));
      run = saved.run;
      pending = saved.pending ?? [];
      await settle();
    } else {
      save();
    }
    if (run) activateTools();
  });

  pi.registerCommand('arsenal-mode', {
    description: 'Controlled workflow: runtime [root], edit-only [root], status, or off.',
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
      if (mode === 'status') {
        ctx.ui.notify(JSON.stringify({ run, pending }), 'info');
        return;
      }
      if (pending.length) throw new Error('A command is pending; await it before changing mode.');
      if (mode === 'off') {
        run = null;
        save();
        pi.setActiveTools(nativeTools);
        ctx.ui.notify('Arsenal controlled mode disabled. Native Pi tools restored.', 'warning');
        return;
      }
      run = newRun(resolve(ctx.cwd, parts.join(' ') || '.'), mode);
      save();
      activateTools();
      ctx.ui.notify(`Arsenal controlled mode: ${mode}; root: ${run.root}.`, 'info');
    }),
  });

  for (const skill of ['ship', 'brief', 'propose', 'arsenal', 'next', 'trace', 'issue', 'websearch']) {
    pi.registerCommand(skill, {
      description: `Run ${skill} with the Arsenal controller.`,
      handler: async (args, ctx) => serialized(async () => {
        await settle();
        if (pending.length) throw new Error('A command is still running.');
        const verification = skill === 'ship' ? 'runtime' : 'edit-only';
        if (!run || run.phase === 'done' || run.verification !== verification) {
          run = newRun(run?.root ?? ctx.cwd, verification);
        }
        save();
        activateTools();
        pi.sendUserMessage(
          `Execute the ${skill} skill for this request: ${args}\nArsenal controlled mode is active. Use arsenal_run for shell commands and call arsenal_finish only after the requested work is complete.`,
          { deliverAs: 'followUp' },
        );
      }),
    });
  }

  const result = (value: unknown) => ({
    content: [{ type: 'text' as const, text: JSON.stringify(value) }],
    details: {},
  });

  pi.registerTool({
    name: 'arsenal_status',
    label: 'Arsenal status',
    description: 'Read the controlled workflow state.',
    parameters: Type.Object({}),
    execute: async () => serialized(async () => {
      await settle();
      return result({ active: run !== null, run, pending });
    }),
  });

  pi.registerTool({
    name: 'arsenal_finish',
    label: 'Finish Arsenal workflow',
    description: 'Finish after the current revision has the required execution evidence.',
    parameters: Type.Object({}),
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
    name: 'arsenal_run',
    label: 'Controlled shell',
    description: 'Run a sandboxed workspace command. Set verification true only for a meaningful final check.',
    parameters: Type.Object({
      command: Type.String(),
      timeout: Type.Optional(Type.Number({ minimum: 1, maximum: 3600 })),
      verification: Type.Optional(Type.Boolean()),
    }),
    execute: async (_id, params) => serialized(async () => {
      await settle();
      if (!run) throw new Error('No controlled run is active.');
      if (params.verification && run.evidence?.revision === run.revision && run.evidence.command === params.command) {
        return result({ cached: true, evidence: run.evidence });
      }
      await change();
      const resultFile = join(storage, `${randomUUID()}.result.json`);
      pending.push({ result: resultFile, verification: params.verification === true, revision: run.revision });
      save();
      const execution = await pi.exec('node', [
        join(runtime, 'runner.mjs'),
        run.root,
        resultFile,
        params.command,
        String(params.timeout ?? 1800),
        storage,
      ], { cwd: run.root });
      await settle();
      const output = [execution.stdout, execution.stderr].filter(Boolean).join('\n');
      return {
        content: [{ type: 'text' as const, text: output || `Command exited with code ${execution.code}.` }],
        details: { exitCode: execution.code },
      };
    }),
  });

  pi.on('tool_call', async event => serialized(async () => {
    if (!run) return;
    await settle();
    const input = event.input as Record<string, unknown>;
    const name = event.toolName;
    try {
      if (['read', 'arsenal_run', 'arsenal_status', 'arsenal_finish'].includes(name)) return;
      if (name === 'write' || name === 'edit') {
        const path = name === 'write' ? input.path : input.path;
        if (typeof path !== 'string') throw new Error('Cannot determine the edit target.');
        const resolved = scopedPath(run.root, path);
        if (resolved === runtime || resolved.startsWith(`${runtime}/`) || resolved === storage || resolved.startsWith(`${storage}/`)) {
          throw new Error('The running policy and its state cannot be edited.');
        }
        await change();
        return { input: { ...input, path: resolved } };
      }
      throw new Error(`Tool ${name} is not available in controlled mode.`);
    } catch (error) {
      return { block: true, reason: error instanceof Error ? error.message : String(error) };
    }
  }));
}
