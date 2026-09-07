import type { ExtensionAPI } from '@earendil-works/pi-coding-agent';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const storage = join(homedir(), '.pi', 'agent', 'arsenal-mode');
const guidance = `

## Arsenal mode

Arsenal mode is enabled. For every request, use the installed Arsenal skill as
the workflow router. Let Arsenal select any installed specialist skill needed
for the request. Use the native Pi tools and permissions without additional
restrictions. Never ask the user to disable Arsenal to perform an action.
`;

export default function arsenalMode(pi: ExtensionAPI) {
  let enabled = false;
  let file = '';

  function save() {
    if (!file) return;
    writeFileSync(`${file}.tmp`, JSON.stringify({ enabled }));
    renameSync(`${file}.tmp`, file);
  }

  pi.on('session_start', async (_event, ctx) => {
    mkdirSync(storage, { recursive: true });
    file = join(storage, `${ctx.sessionManager.getSessionId()}.json`);
    enabled = existsSync(file) && JSON.parse(readFileSync(file, 'utf8')).enabled === true;
    save();
  });

  pi.on('before_agent_start', async event => enabled
    ? { systemPrompt: `${event.systemPrompt}${guidance}` }
    : undefined);

  pi.registerCommand('arsenal-mode', {
    description: 'Toggle continuous Arsenal routing without restricting Pi.',
    getArgumentCompletions: prefix => ['on', 'off', 'status']
      .filter(value => value.startsWith(prefix))
      .map(value => ({ value, label: value })),
    handler: async (args, ctx) => {
      let mode = args.trim().replace(/^\/?arsenal-mode\s*/, '');
      if (!mode) mode = await ctx.ui.select('Choose Arsenal mode', ['on', 'off']) ?? '';
      if (!mode) return;
      if (mode === 'status') {
        ctx.ui.notify(`Arsenal mode: ${enabled ? 'on' : 'off'}`, 'info');
        return;
      }
      if (mode !== 'on' && mode !== 'off') throw new Error('Use on, off, or status.');
      enabled = mode === 'on';
      save();
      ctx.ui.notify(`Arsenal mode: ${mode}. Native Pi permissions unchanged.`, 'info');
    },
  });
}
