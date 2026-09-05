import { Annotation, END, START, StateGraph } from '@langchain/langgraph';
import { parse } from 'acorn';
import { lstatSync, realpathSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';

const State = Annotation.Root({ data: Annotation(), event: Annotation() });
const workflow = new StateGraph(State)
  .addNode('transition', ({ data, event }) => {
    if (data.phase === 'done' && event.type !== 'status') throw new Error('Run already finished. Start a new run explicitly.');
    switch (event.type) {
      case 'status': return { data };
      case 'change': return { data: { ...data, phase: 'working', revision: data.revision + 1, evidence: null } };
      case 'verified':
        if (event.exitCode !== 0) return { data: { ...data, phase: 'working', evidence: null, failures: data.failures + 1 } };
        return { data: { ...data, phase: 'verified', evidence: { command: event.command, revision: data.revision, exitCode: 0 } } };
      case 'finish':
        if (data.verification !== 'edit-only' && (!data.evidence || data.evidence.revision !== data.revision)) throw new Error('A successful check covering the current revision is required.');
        return { data: { ...data, phase: 'done' } };
      default: throw new Error('Unknown workflow transition.');
    }
  })
  .addEdge(START, 'transition').addEdge('transition', END).compile();

export function newRun(root, verification = 'runtime') {
  const canonical = realpathSync(root);
  if (dirname(canonical) === canonical) throw new Error('A filesystem root is not a project scope.');
  if (!['runtime', 'edit-only'].includes(verification)) throw new Error('Invalid verification mode.');
  return { root: canonical, verification, phase: 'working', revision: 0, evidence: null, failures: 0 };
}

export async function transition(data, event) {
  return (await workflow.invoke({ data, event })).data;
}

export function scopedPath(root, input) {
  if (typeof input !== 'string' || input.includes('\0') || /^[a-z]+:\/\//i.test(input)) throw new Error('A local filesystem path is required.');
  const target = resolve(root, input);
  let existing = target;
  while (true) {
    try { lstatSync(existing); break; } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      const parent = dirname(existing);
      if (parent === existing) throw error;
      existing = parent;
    }
  }
  const canonical = resolve(realpathSync(existing), relative(existing, target));
  const rel = relative(root, canonical);
  if (rel === '..' || rel.startsWith(`..${sep}`) || isAbsolute(rel)) throw new Error('Write outside the authorized root refused.');
  try {
    const stat = lstatSync(target);
    if (stat.isFile() && stat.nlink > 1) throw new Error('Writing a multiply-linked file is refused.');
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  return canonical;
}

function literal(node) {
  if (!node) return false;
  if (node.type === 'Literal') return node.regex === undefined && node.bigint === undefined;
  if (node.type === 'UnaryExpression') return ['-', '+'].includes(node.operator) && node.argument.type === 'Literal' && typeof node.argument.value === 'number';
  if (node.type === 'ArrayExpression') return node.elements.every(literal);
  if (node.type === 'ObjectExpression') return node.properties.every(p => p.type === 'Property' && p.kind === 'init' && !p.method && !p.computed && !p.shorthand && literal(p.value));
  return false;
}

function toolCall(node) {
  if (node.type !== 'AwaitExpression') return false;
  const call = node.argument;
  return call.type === 'CallExpression' && !call.optional && call.arguments.length === 1 && literal(call.arguments[0]) &&
    call.callee.type === 'MemberExpression' && !call.callee.computed && !call.callee.optional &&
    call.callee.object.type === 'Identifier' && call.callee.object.name === 'tool' && call.callee.property.type === 'Identifier';
}

export function bridgeOnly(code, language) {
  if (language !== 'js') throw new Error('Controlled Eval accepts only the JavaScript tool bridge.');
  const ast = parse(code, { ecmaVersion: 'latest', sourceType: 'module', allowAwaitOutsideFunction: true });
  if (!ast.body.length || !ast.body.every(statement => {
    if (statement.type === 'EmptyStatement') return true;
    if (statement.type !== 'ExpressionStatement') return false;
    const node = statement.expression;
    if (toolCall(node)) return true;
    return node.type === 'CallExpression' && !node.optional && node.callee.type === 'Identifier' && node.callee.name === 'display' && node.arguments.length === 1 && toolCall(node.arguments[0]);
  })) throw new Error('Unrestricted Eval is disabled in controlled mode. Use display(await tool.NAME({literal arguments})); or a sandboxed command.');
}
