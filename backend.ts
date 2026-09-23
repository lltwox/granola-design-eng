export type UploadStage = "uploading" | "transcribing";

export type SimulatedFailure = "upload" | "transcription";

export type UploadErrorCode =
  "INVALID_FILE_TYPE" | "UPLOAD_FAILED" | "TRANSCRIPTION_FAILED";

export type UploadProgress = {
  stage: UploadStage;
  progress: number;
};

export type UploadResult = {
  id: string;
  fileName: string;
  status: "complete";
};

export type SimulateUploadOptions = {
  failure?: SimulatedFailure;
  onProgress?: (progress: UploadProgress) => void;
  signal?: AbortSignal;
  transcriptionDuration?: number;
  uploadDuration?: number;
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
const SIMULATION_STEPS = 20;

export async function simulateAudioUpload(
  file: File,
  options: SimulateUploadOptions = {},
): Promise<UploadResult> {
  const {
    failure,
    onProgress,
    signal,
    transcriptionDuration = 1_800,
    uploadDuration = 2_400,
  } = options;

  throwIfAborted(signal);
  await validateWavFile(file);
  throwIfAborted(signal);

  await simulateStage("uploading", uploadDuration, onProgress, signal, () => {
    if (failure === "upload") {
      throw new UploadSimulationError(
        "UPLOAD_FAILED",
        "The upload failed. Please try again.",
      );
    }
  });

  await simulateStage(
    "transcribing",
    transcriptionDuration,
    onProgress,
    signal,
    () => {
      if (failure === "transcription") {
        throw new UploadSimulationError(
          "TRANSCRIPTION_FAILED",
          "The transcription failed. Please try again.",
        );
      }
    },
  );

  return {
    id: `upload-${Date.now()}`,
    fileName: file.name,
    status: "complete",
  };
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

async function simulateStage(
  stage: UploadStage,
  duration: number,
  onProgress: SimulateUploadOptions["onProgress"],
  signal: AbortSignal | undefined,
  fail: () => void,
) {
  onProgress?.({ stage, progress: 0 });

  for (let step = 1; step <= SIMULATION_STEPS; step += 1) {
    await delay(duration / SIMULATION_STEPS, signal);
    const progress = Math.round((step / SIMULATION_STEPS) * 100);
    onProgress?.({ stage, progress });

    if (step === Math.ceil(SIMULATION_STEPS / 2)) {
      fail();
    }
  }
}

function delay(milliseconds: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(createAbortError());
      return;
    }

    const handleAbort = () => {
      window.clearTimeout(timeout);
      reject(createAbortError());
    };
    const timeout = window.setTimeout(() => {
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
