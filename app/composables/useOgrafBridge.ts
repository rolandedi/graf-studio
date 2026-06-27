import { ref, onUnmounted, watch, type Ref } from "vue";

type CommandType =
  | "ograf:load"
  | "ograf:playAction"
  | "ograf:stopAction"
  | "ograf:updateAction"
  | "ograf:dispose";

interface BridgeMessage {
  type: CommandType;
  requestId: string;
  [key: string]: unknown;
}

interface BridgeResponse {
  type: "ograf:response" | "ograf:error" | "ograf:ready";
  requestId?: string;
  statusCode?: number;
  statusMessage?: string;
  currentStep?: number;
  result?: unknown;
  error?: string;
}

interface LoadParams {
  data?: Record<string, unknown>;
  renderType?: "realtime" | "non-realtime";
  renderCharacteristics?: Record<string, unknown>;
}

interface PlayActionParams {
  goto?: number;
  delta?: number;
  skipAnimation?: boolean;
}

interface StopActionParams {
  skipAnimation?: boolean;
}

interface UpdateActionParams {
  data: Record<string, unknown>;
  skipAnimation?: boolean;
}

const DEFAULT_TIMEOUT = 10000; // 10 seconds

function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Composable for communicating with an OGraf graphic inside an iframe
 * via postMessage.
 */
export function useOgrafBridge(iframeRef: Ref<HTMLIFrameElement | null>) {
  const isReady = ref(false);
  const currentStep = ref<number | undefined>(undefined);
  const lastError = ref<string | null>(null);

  const pendingRequests = new Map<
    string,
    {
      resolve: (value: BridgeResponse) => void;
      reject: (reason: Error) => void;
      timer: ReturnType<typeof setTimeout>;
    }
  >();

  function handleMessage(event: MessageEvent) {
    // Verify origin — blob URLs share the page origin
    if (event.origin !== location.origin) return;
    const data = event.data as BridgeResponse;
    if (!data?.type?.startsWith("ograf:")) return;

    if (data.type === "ograf:ready") {
      isReady.value = true;
      return;
    }

    if (!data.requestId) return;
    const pending = pendingRequests.get(data.requestId);
    if (!pending) return;

    clearTimeout(pending.timer);
    pendingRequests.delete(data.requestId);

    if (data.type === "ograf:error") {
      lastError.value = data.error ?? "Unknown error";
      pending.reject(new Error(data.error ?? "Unknown error"));
    } else {
      if (data.currentStep !== undefined) {
        currentStep.value = data.currentStep;
      }
      lastError.value = null;
      pending.resolve(data);
    }
  }

  function send(
    type: CommandType,
    params: object = {},
    timeout = DEFAULT_TIMEOUT,
  ): Promise<BridgeResponse> {
    return new Promise((resolve, reject) => {
      const iframe = iframeRef.value;
      if (!iframe?.contentWindow) {
        reject(new Error("Iframe not available"));
        return;
      }

      const requestId = generateRequestId();
      const message: BridgeMessage = {
        type,
        requestId,
        ...(params as Record<string, unknown>),
      };

      const timer = setTimeout(() => {
        pendingRequests.delete(requestId);
        reject(new Error(`Command ${type} timed out after ${timeout}ms`));
      }, timeout);

      pendingRequests.set(requestId, { resolve, reject, timer });

      iframe.contentWindow.postMessage(message, location.origin);
    });
  }

  async function waitForReady(timeout = 5000): Promise<void> {
    if (isReady.value) return;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error("Iframe did not signal ready in time"));
      }, timeout);

      const unwatch = watch(isReady, (ready) => {
        if (ready) {
          clearTimeout(timer);
          unwatch();
          resolve();
        }
      });
    });
  }

  async function load(params: LoadParams = {}): Promise<BridgeResponse> {
    await waitForReady();
    return send("ograf:load", params);
  }

  async function playAction(
    params: PlayActionParams = {},
  ): Promise<BridgeResponse> {
    return send("ograf:playAction", params);
  }

  async function stopAction(
    params: StopActionParams = {},
  ): Promise<BridgeResponse> {
    return send("ograf:stopAction", params);
  }

  async function updateAction(
    params: UpdateActionParams,
  ): Promise<BridgeResponse> {
    return send("ograf:updateAction", params);
  }

  async function dispose(): Promise<BridgeResponse> {
    return send("ograf:dispose", {});
  }

  function reset() {
    isReady.value = false;
    currentStep.value = undefined;
    lastError.value = null;
    for (const [, pending] of pendingRequests) {
      clearTimeout(pending.timer);
      pending.reject(new Error("Bridge reset"));
    }
    pendingRequests.clear();
  }

  if (import.meta.client) {
    window.addEventListener("message", handleMessage);
    onUnmounted(() => {
      window.removeEventListener("message", handleMessage);
      for (const [, pending] of pendingRequests) {
        clearTimeout(pending.timer);
      }
      pendingRequests.clear();
    });
  }

  return {
    isReady,
    currentStep,
    lastError,
    load,
    playAction,
    stopAction,
    updateAction,
    dispose,
    reset,
    waitForReady,
  };
}
