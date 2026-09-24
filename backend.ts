export type SimulatedFailure = "upload" | "transcription";

export type UploadErrorCode =
  "INVALID_FILE_TYPE" | "UPLOAD_FAILED" | "TRANSCRIPTION_FAILED";

export type UploadUpdate =
  { progress: number; stage: "uploading" } | { stage: "transcribing" };

export type UploadResult = {
  id: string;
  fileName: string;
  status: "complete";
};

export type SimulateUploadOptions = {
  failure?: SimulatedFailure;
  onUpdate?: (update: UploadUpdate) => void;
  signal?: AbortSignal;
  transcriptionDuration?: number;
  uploadDuration?: number;
};

export type SimulateTranscriptionOptions = {
  failure?: boolean;
  signal?: AbortSignal;
  transcriptionDuration?: number;
};

export class UploadSimulationError extends Error {
  constructor(
    public readonly code: UploadErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "UploadSimulationError";
  }
}

const WAV_HEADER_LENGTH = 12;
const SIMULATION_STEPS = 100;
const TRANSCRIPTION_DURATION = 221_800;
const UPLOAD_DURATION = 2_400;

export async function simulateAudioUpload(
  file: File,
  options: SimulateUploadOptions = {},
): Promise<UploadResult> {
  const {
    failure,
    onUpdate,
    signal,
    transcriptionDuration = TRANSCRIPTION_DURATION,
    uploadDuration = UPLOAD_DURATION,
  } = options;

  throwIfAborted(signal);
  await validateWavFile(file);
  throwIfAborted(signal);

  await simulateUpload(uploadDuration, onUpdate, signal, () => {
    if (failure === "upload") {
      throw new UploadSimulationError(
        "UPLOAD_FAILED",
        "The upload failed. Please try again.",
      );
    }
  });

  onUpdate?.({ stage: "transcribing" });
  await simulateAudioTranscription({
    failure: failure === "transcription",
    signal,
    transcriptionDuration,
  });

  return {
    id: `upload-${Date.now()}`,
    fileName: file.name,
    status: "complete",
  };
}

export async function simulateAudioTranscription(
  options: SimulateTranscriptionOptions = {},
) {
  const {
    failure = false,
    signal,
    transcriptionDuration = TRANSCRIPTION_DURATION,
  } = options;

  throwIfAborted(signal);
  await simulateTranscription(transcriptionDuration, signal, () => {
    if (failure) {
      throw new UploadSimulationError(
        "TRANSCRIPTION_FAILED",
        "There was a temporary problem with the transcription service",
      );
    }
  });
}

async function validateWavFile(file: File) {
  const hasWavExtension = file.name.toLowerCase().endsWith(".wav");
  const header = new Uint8Array(
    await file.slice(0, WAV_HEADER_LENGTH).arrayBuffer(),
  );
  const isRiffWave =
    readAscii(header, 0, 4) === "RIFF" && readAscii(header, 8, 12) === "WAVE";

  if (!hasWavExtension || !isRiffWave) {
    throw new UploadSimulationError(
      "INVALID_FILE_TYPE",
      "Choose a WAV audio file to continue.",
    );
  }
}

async function simulateUpload(
  duration: number,
  onUpdate: SimulateUploadOptions["onUpdate"],
  signal: AbortSignal | undefined,
  fail: () => void,
) {
  onUpdate?.({ progress: 0, stage: "uploading" });

  if (!Number.isFinite(duration)) {
    await delay(duration, signal);
    return;
  }

  for (let step = 1; step <= SIMULATION_STEPS; step += 1) {
    await delay(duration / SIMULATION_STEPS, signal);
    const progress = Math.round((step / SIMULATION_STEPS) * 100);
    onUpdate?.({ progress, stage: "uploading" });

    if (step === Math.ceil(SIMULATION_STEPS / 2)) {
      fail();
    }
  }
}

async function simulateTranscription(
  duration: number,
  signal: AbortSignal | undefined,
  fail: () => void,
) {
  await delay(duration / 2, signal);
  fail();
  await delay(duration / 2, signal);
}

function delay(milliseconds: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(createAbortError());
      return;
    }

    let timeout: number | undefined;
    const handleAbort = () => {
      if (timeout !== undefined) {
        window.clearTimeout(timeout);
      }
      reject(createAbortError());
    };

    if (!Number.isFinite(milliseconds)) {
      signal?.addEventListener("abort", handleAbort, { once: true });
      return;
    }

    timeout = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);
      resolve();
    }, milliseconds);

    signal?.addEventListener("abort", handleAbort, { once: true });
  });
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw createAbortError();
  }
}

function createAbortError() {
  return new DOMException("The upload was cancelled.", "AbortError");
}

function readAscii(bytes: Uint8Array, start: number, end: number) {
  return String.fromCharCode(...bytes.slice(start, end));
}
