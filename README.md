# opencode-kokotolk

OpenCode TUI plugin that reads the **last assistant message** aloud using
my self-built kokoro CLI tool that uses the TTS library of the same name.

It is thin glue: the plugin grabs the last assistant message text, pipes it to
`kokoro`'s stdin, and lets the Python TTS engine play it directly. No wav files
are written and no external player is needed.

## Features

- Press `f7` to speak the current session's last assistant message.
- Toasts report success, warnings (no message yet), or errors.
- `kokoro`'s stdout/stderr are suppressed so nothing spills into your terminal.

## Triggering the plugin

- **`f7`** speaks the current session's last assistant message.

`f7` is the only trigger. opencode's `ctrl+p` command list and typed `/`
autocomplete only show config-based slash commands (prompt templates), not
TUI-keymap plugin commands, so this plugin's action is reachable solely through
its keybinding.

## Requirements

- OpenCode with TUI plugin support.
- Node.js >= 20.
- A `kokoro` executable on `PATH` that reads text from stdin and plays it
  (for example the `kokoro.py` + `kokoro.sh` setup).

## Install

Clone the repo, then register the plugin file in your global `tui.json`:

```shell
git clone https://github.com/you/opencode-kokotolk.git
# add to ~/.config/opencode/tui.json:
#   "plugin": [["/abs/path/to/opencode-kokotolk/plugins/talk.ts", { "hotkey": "f7" }]]
```

Restart opencode (config is not hot-reloaded). The `f7` hotkey is the default
bound by the plugin; it can be changed via the `bindings` entry in
`plugins/talk.ts`.

### Alternative: install as a package

The repo exposes a `./tui` entrypoint, so it can also be installed from a path
or npm spec via the opencode installer:

```shell
opencode plugin /abs/path/to/opencode-kokotolk --global
```

## Development

```shell
npm install
npm run typecheck
```

The plugin imports the SDK types only (`import type`); the only runtime
dependency is Node's built-in `node:child_process`, so opencode loads the
`.ts` file directly with no build step.

## Notes

- The plugin always speaks the last **assistant** message of the current
  session, markdown and code included verbatim.
- Config edits to `tui.json` are not committed by the repo itself; they live in
  your opencode config.

## License

See [LICENSE](LICENSE) file.
