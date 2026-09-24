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
  onUpdate?: (update: UploadUpdate) => void;
};

export type BackendDebugOptions = {
  transcriptionDuration: number;
  transcriptionError: boolean;
  uploadDuration: number;
  uploadError: boolean;
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
let backendDebugOptions: BackendDebugOptions = {
  transcriptionDuration: 10_000,
  transcriptionError: false,
  uploadDuration: 3_000,
  uploadError: false,
};

export function getBackendDebugOptions(): BackendDebugOptions {
  return { ...backendDebugOptions };
}

export function setBackendDebugOptions(options: BackendDebugOptions) {
  backendDebugOptions = { ...options };
}

export async function simulateAudioUpload(
  file: File,
  options: SimulateUploadOptions = {},
): Promise<UploadResult> {
  const { onUpdate } = options;
  const {
    transcriptionDuration,
    transcriptionError,
    uploadDuration,
    uploadError,
  } = backendDebugOptions;

  await validateWavFile(file);

  await simulateUpload(uploadDuration, onUpdate, () => {
    if (uploadError) {
      throw new UploadSimulationError(
        "UPLOAD_FAILED",
        "The upload failed. Please try again.",
      );
    }
  });

  onUpdate?.({ stage: "transcribing" });
  await simulateTranscriptionPhase({
    failure: transcriptionError,
    transcriptionDuration,
  });

  return {
    id: `upload-${Date.now()}`,
    fileName: file.name,
    status: "complete",
  };
}

export async function simulateAudioTranscription() {
  const { transcriptionDuration, transcriptionError } = backendDebugOptions;

  await simulateTranscriptionPhase({
    failure: transcriptionError,
    transcriptionDuration,
  });
}

type TranscriptionPhaseOptions = {
  failure: boolean;
  transcriptionDuration: number;
};

async function simulateTranscriptionPhase({
  failure,
  transcriptionDuration,
}: TranscriptionPhaseOptions) {
  await simulateTranscription(transcriptionDuration, () => {
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
  fail: () => void,
) {
  onUpdate?.({ progress: 0, stage: "uploading" });

  if (!Number.isFinite(duration)) {
    await delay(duration);
    return;
  }

  for (let step = 1; step <= SIMULATION_STEPS; step += 1) {
    await delay(duration / SIMULATION_STEPS);
    const progress = Math.round((step / SIMULATION_STEPS) * 100);
    onUpdate?.({ progress, stage: "uploading" });

    if (step === Math.ceil(SIMULATION_STEPS / 2)) {
      fail();
    }
  }
}

async function simulateTranscription(duration: number, fail: () => void) {
  await delay(duration / 2);
  fail();
  await delay(duration / 2);
}

function delay(milliseconds: number) {
  return new Promise<void>((resolve) => {
    if (!Number.isFinite(milliseconds)) {
      return;
    }

    window.setTimeout(resolve, milliseconds);
  });
}

function readAscii(bytes: Uint8Array, start: number, end: number) {
  return String.fromCharCode(...bytes.slice(start, end));
}
