// Bridge postMessage editor (Azgaar) <-> Tale.
// Types are duplicated from apps/tale/src/features/game-create/bridge-types.ts.

type ToEditorMessage =
  | { type: "regenerateMap"; seed?: string }
  | { type: "setLayer"; layer: string; visible: boolean }
  | { type: "setStylePreset"; preset: string }
  | { type: "loadMap"; payload: string }
  | { type: "exportMap" }
  | { type: "loadPreset"; presetId: string };

type FromEditorMessage =
  | { type: "editorReady"; version: string }
  | { type: "mapExported"; payload: string; meta: MapMeta }
  | { type: "mapDirty"; dirty: boolean }
  | { type: "error"; code: string; message: string };

type MapMeta = {
  seed: string;
  width: number;
  height: number;
  cellsCount: number;
  azgaarVersion: string;
};

type VersionedWindow = Window & {
  VERSION?: string;
};

const ALLOWED_PARENT_ORIGINS = ["*"];

function postToParent(msg: FromEditorMessage) {
  if (window.parent === window) return;
  window.parent.postMessage(msg, "*");
}

function isToEditorMessage(data: unknown): data is ToEditorMessage {
  return typeof data === "object" && data !== null && "type" in data;
}

function handleMessage(msg: ToEditorMessage) {
  console.log("[tale-bridge] received", msg);
}

window.addEventListener("message", (event) => {
  if (!ALLOWED_PARENT_ORIGINS.includes("*") && !ALLOWED_PARENT_ORIGINS.includes(event.origin)) {
    return;
  }

  if (!isToEditorMessage(event.data)) return;
  handleMessage(event.data);
});

window.addEventListener("load", () => {
  setTimeout(() => {
    const versionText = document.getElementById("versionText")?.textContent?.trim();
    const version =
      (window as VersionedWindow).VERSION ??
      document.querySelector("meta[name='version']")?.getAttribute("content") ??
      versionText?.replace(/^v/, "") ??
      "unknown";

    postToParent({type: "editorReady", version});
  }, 200);
});
