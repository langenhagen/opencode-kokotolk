import { spawn } from "node:child_process";

import type { TextPart } from "@opencode-ai/sdk/v2";
import type { TuiPlugin, TuiPluginModule } from "@opencode-ai/plugin/tui";

const tui: TuiPlugin = async (api) => {
  const getCurrentSessionID = (): string | undefined => {
    const current = api.route.current;
    if (current.name === "session" && current.params) {
      const sessionID = current.params.sessionID;
      return typeof sessionID === "string" ? sessionID : undefined;
    }
    return undefined;
  };

  const getLastAssistantText = (sessionID: string): string => {
    const messages = api.state.session.messages(sessionID);
    const lastAssistant = [...messages]
      .reverse()
      .find((message) => message.role === "assistant");
    if (!lastAssistant) {
      return "";
    }
    const parts = api.state.part(lastAssistant.id);
    return parts
      .filter((part): part is Extract<typeof part, TextPart> => part.type === "text")
      .map((part) => part.text)
      .join("\n");
  };

  const speak = async (sessionID: string | undefined): Promise<void> => {
    if (!sessionID) {
      api.ui.toast({ variant: "warning", message: "No active session to speak." });
      return;
    }
    const text = getLastAssistantText(sessionID);
    if (!text.trim()) {
      api.ui.toast({ variant: "warning", message: "No assistant message to speak yet." });
      return;
    }
    const child = spawn("kokoro", [], { stdio: ["pipe", "ignore", "ignore"] });
    child.on("error", (err) => {
      api.ui.toast({ variant: "error", message: `kokoro failed: ${err.message}` });
    });
    child.on("exit", (code) => {
      api.ui.toast({
        variant: code === 0 ? "success" : "error",
        message: code === 0 ? "Speaking complete." : `kokoro exited with code ${code}`,
      });
    });
    child.stdin.write(text);
    child.stdin.end();
  };

  // The only reliable trigger for plugin code is a keybinding: opencode's
  // `ctrl+p` and typed `/` surfaces only list config-based slash commands, so
  // this command is reachable solely through the `f7` binding below.
  api.keymap.registerLayer({
    mode: "base",
    commands: [
      {
        name: "talk.speak",
        title: "Talk: speak last assistant message",
        category: "Plugin",
        run: () => speak(getCurrentSessionID()),
      },
    ],
    bindings: [{ key: "f7", cmd: "talk.speak", desc: "Speak last assistant message" }],
  });
};

const plugin: TuiPluginModule & { id: string } = {
  id: "talk",
  tui,
};

export default plugin;
