#!/usr/bin/env node
// Stands in for hc, herdr and tmux (called through symlinks of those names).
// Every call is logged; status queries pop a scripted queue from FAKE_STATE.
const fs = require("node:fs");
const path = require("node:path");

const file = process.env.FAKE_STATE;
const state = JSON.parse(fs.readFileSync(file, "utf8"));
const name = path.basename(process.argv[1]);
const args = process.argv.slice(2);
const said = args.join(" ");
state.log.push(`${name} ${said}`);

const pop = () => state.queue.shift() || "idle";
const typed = (text) => {
  if (text === "clear") {
    state.queue.push(...state.afterClear);
    state.screen = "";
  }
  if (text === "next") {
    state.queue.push(...state.afterNext);
    state.screen = `${state.banner}\n> ${state.nextShown}\n${state.reply}`;
  }
};

let out = "";
if (name === "hc") {
  if (args[0] === "ls") {
    out = JSON.stringify({
      terminals: [
        { address: "t-cmd", agent: "zsh" },
        { address: state.target, agent: "claude", status: pop() },
      ],
    });
  } else if (args[0] === "keys" && said.includes("c l e a r")) typed("clear");
  else if (args[0] === "send" && said.includes("next:next")) typed("next");
  else if (args[0] === "read") out = state.screen;
} else if (name === "herdr") {
  if (args[1] === "get") out = JSON.stringify({ result: { pane: { agent: "claude", agent_status: pop() } } });
  else if (args[1] === "send-text" && args[3] === "/clear") typed("clear");
  else if (args[1] === "send-text" && args[3] === "/next:next") typed("next");
  else if (args[1] === "read") out = state.screen;
} else if (name === "tmux") {
  if (args[0] === "capture-pane") {
    out = pop() === "working" ? `spinner ${++state.tick}\n${state.screen}` : state.screen;
  } else if (args[0] === "send-keys" && args.at(-1) === "/clear") typed("clear");
  else if (args[0] === "send-keys" && args.at(-1) === "/next:next") typed("next");
}

fs.writeFileSync(file, JSON.stringify(state));
process.stdout.write(out);
