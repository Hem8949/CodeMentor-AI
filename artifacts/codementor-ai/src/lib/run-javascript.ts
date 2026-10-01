type WorkerMessage = { output?: string };

const OUTPUT_LIMIT = 12_000;

const workerSource = `
let output = "";
let truncated = false;
const stringify = (value) => {
  if (typeof value === "string") return value;
  try {
    const json = JSON.stringify(value);
    return json === undefined ? String(value) : json;
  } catch {
    return String(value);
  }
};
const write = (level, values) => {
  if (output.length >= ${OUTPUT_LIMIT}) {
    truncated = true;
    return;
  }
  const prefix = level === "log" ? "" : level.toUpperCase() + ": ";
  output += (output ? "\\\\n" : "") + prefix + values.map(stringify).join(" ");
  if (output.length > ${OUTPUT_LIMIT}) {
    output = output.slice(0, ${OUTPUT_LIMIT});
    truncated = true;
  }
};
const safeConsole = {
  log: (...values) => write("log", values),
  info: (...values) => write("info", values),
  warn: (...values) => write("warn", values),
  error: (...values) => write("error", values),
};
globalThis.console = safeConsole;
const blocked = () => { throw new Error("Network access is disabled in this practice runner."); };
globalThis.fetch = () => Promise.reject(new Error("Network access is disabled in this practice runner."));
globalThis.importScripts = blocked;
globalThis.XMLHttpRequest = undefined;
globalThis.WebSocket = undefined;
globalThis.EventSource = undefined;
globalThis.Worker = undefined;
globalThis.SharedWorker = undefined;
self.onmessage = async ({ data }) => {
  try {
    const run = new Function("console", '"use strict";\\\\n' + data.code);
    const result = run(safeConsole);
    if (result && typeof result.then === "function") {
      const resolved = await result;
      if (resolved !== undefined) safeConsole.log(resolved);
    } else if (result !== undefined) {
      safeConsole.log(result);
    }
    self.postMessage({ output: (output || "Finished without console output.") + (truncated ? "\\\\n… output truncated" : "") });
  } catch (error) {
    const message = error && typeof error === "object" && "stack" in error
      ? String(error.stack)
      : String(error);
    self.postMessage({ output: (output ? output + "\\\\n\\\\n" : "") + message });
  }
};
`;

export function runJavaScriptInWorker(code: string, timeoutMs = 1800): Promise<string> {
  if (typeof Worker === "undefined" || typeof Blob === "undefined") {
    return Promise.reject(new Error("This browser doesn't support the isolated code runner."));
  }

  const objectUrl = URL.createObjectURL(new Blob([workerSource], { type: "text/javascript" }));
  let worker: Worker;
  try {
    worker = new Worker(objectUrl);
  } catch (error) {
    URL.revokeObjectURL(objectUrl);
    return Promise.reject(error);
  }

  return new Promise((resolve) => {
    let finished = false;
    const finish = (output: string) => {
      if (finished) return;
      finished = true;
      window.clearTimeout(timeout);
      worker.terminate();
      URL.revokeObjectURL(objectUrl);
      resolve(output);
    };
    const timeout = window.setTimeout(
      () => finish("Execution stopped after 1.8 seconds. Check for a loop that never ends."),
      timeoutMs,
    );

    worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
      const output = typeof event.data?.output === "string" ? event.data.output : "The code finished without readable output.";
      finish(output.slice(0, OUTPUT_LIMIT + 200));
    };
    worker.onerror = (event) => {
      event.preventDefault();
      finish(`Error: ${event.message || "Your code couldn't be run."}`);
    };
    worker.onmessageerror = () => finish("The code runner couldn't read the result.");
    worker.postMessage({ code });
  });
}