import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const [rootArg, resultFile, command, timeoutArg, storageArg] = process.argv.slice(2);
let lock;
let scratch;
let exitCode = 125;
let failure;
try {
  if (!rootArg || !resultFile || !command) throw new Error('Usage: runner root result command timeoutSeconds [storage]');
  const root = realpathSync(rootArg);
  const timeout = Number(timeoutArg ?? 1800);
  if (!Number.isFinite(timeout) || timeout < 1 || timeout > 3600) throw new Error('Timeout must be between 1 and 3600 seconds.');
  if (process.platform !== 'darwin' || !existsSync('/usr/bin/sandbox-exec')) throw new Error('Controlled shell requires the verified macOS sandbox backend; refusing unsandboxed execution.');
  const storage = storageArg ? resolve(storageArg) : join(homedir(), '.omp', 'agent', 'arsenal-runtime');
  const lockRoot = join(storage, 'locks');
  mkdirSync(lockRoot, { recursive: true });
  const candidate = join(lockRoot, createHash('sha256').update(root).digest('hex'));
  try { mkdirSync(candidate); } catch (error) {
    if (error.code !== 'EEXIST') throw error;
    let owner = 'unknown';
    try { owner = readFileSync(join(candidate, 'owner.json'), 'utf8'); } catch {}
    exitCode = 75;
    throw new Error(`Workspace command already running or requires recovery: ${owner}`);
  }
  lock = candidate;
  writeFileSync(join(lock, 'owner.json'), JSON.stringify({ pid: process.pid, root, started: new Date().toISOString(), resultFile }));
  scratch = realpathSync(mkdtempSync(join(tmpdir(), 'arsenal-command-')));
  const profile = `(version 1)
(deny default)
(allow file-read*)
(allow process-exec)
(allow process-fork)
(allow sysctl-read)
(allow signal (target self))
(allow file-write* (subpath ${JSON.stringify(root)}) (subpath ${JSON.stringify(scratch)}) (literal "/dev/null") (literal "/dev/tty"))
(deny file-write* (subpath ${JSON.stringify(dirname(fileURLToPath(import.meta.url)))}) (subpath ${JSON.stringify(storage)}))
(allow mach-lookup (global-name "com.apple.system.logger"))`;
  const env = {
    PATH: process.env.PATH ?? '/usr/bin:/bin:/usr/sbin:/sbin',
    HOME: homedir(), TMPDIR: `${scratch}/`, LANG: 'en_US.UTF-8',
    CARGO_HOME: join(homedir(), '.cargo'), RUSTUP_HOME: join(homedir(), '.rustup'),
  };
  exitCode = await new Promise((accept) => {
    const child = spawn('/usr/bin/sandbox-exec', ['-p', profile, '/bin/sh', '-c', command], { cwd: root, env, stdio: 'inherit', detached: true });
    let forced = false;
    let escalation;
    let finished = false;
    const kill = (signal) => { if (child.pid) { try { process.kill(-child.pid, signal); } catch {} } };
    const stop = () => {
      if (forced) return;
      forced = true;
      kill('SIGTERM');
      escalation = setTimeout(() => kill('SIGKILL'), 2000);
    };
    process.on('SIGTERM', stop);
    process.on('SIGINT', stop);
    const timer = setTimeout(stop, timeout * 1000);
    const finish = (code) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      clearTimeout(escalation);
      process.off('SIGTERM', stop);
      process.off('SIGINT', stop);
      // Descendants cannot keep writing after the command result is recorded.
      kill('SIGKILL');
      accept(forced ? 124 : code);
    };
    child.on('error', error => { failure = error.message; finish(127); });
    child.on('exit', (code, signal) => { if (signal) failure = signal; finish(code ?? 128); });
  });
} catch (error) {
  failure = error.message;
  console.error(failure);
} finally {
  if (resultFile) {
    writeFileSync(`${resultFile}.tmp`, JSON.stringify({ exitCode, command, root: rootArg, error: failure, finished: new Date().toISOString() }));
    renameSync(`${resultFile}.tmp`, resultFile);
  }
  if (lock) rmSync(lock, { recursive: true });
  if (scratch) rmSync(scratch, { recursive: true, force: true });
}
process.exitCode = exitCode;
