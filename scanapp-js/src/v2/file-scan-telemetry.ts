declare let gtag: Function;

// Optional measurement must never prevent a scanner action or result.
export function optionalTelemetry(send: () => void): void {
  try {
    send();
  } catch (_) {
    // Tracking may be unavailable, blocked or replaced by a throwing script.
  }
}

type FileScanOutcome = "presented" | "decode_failed" | "presentation_failed" | "busy" | "view_left";

export class FileScanAttempt {
  private readonly startedAt = Date.now();
  private finished = false;

  constructor() {
    this.emit("file_scan_start", "started");
  }

  public finish(outcome: FileScanOutcome): void {
    if (this.finished) return;
    this.finished = true;
    this.emit(outcome === "presented" ? "file_scan_result_presented" : "file_scan_error", outcome);
  }

  private emit(name: string, outcome: string): void {
    optionalTelemetry(() => {
      if (window.location.hostname !== "scanapp.org" || typeof gtag !== "function") return;
      const params: {[key: string]: string | number} = {
        contract_version: "1",
        scan_mode: "file",
        outcome
      };
      if (this.finished) {
        params.elapsed_ms = Math.min(600000, Math.max(0, Date.now() - this.startedAt));
      }
      gtag("event", name, params);
    });
  }
}
