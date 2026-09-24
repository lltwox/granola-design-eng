import { type DragEvent, useEffect, useRef, useState } from "react";

import {
  simulateAudioTranscription,
  simulateAudioUpload,
  type UploadErrorCode,
} from "../../backend.js";

import AudioUploadButton from "./AudioUploadButton.js";
import AudioUploadIndicator from "./AudioUploadIndicator.js";
import AudioUploadInstructions from "./AudioUploadInstructions.js";

type UploadFile = Pick<File, "name" | "size">;

const INVALID_FILE_ERROR_DURATION = 3_000;

export type AudioUploadDebugOptions = {
  transcriptionDuration: number;
  transcriptionError: boolean;
  uploadDuration: number;
  uploadError: boolean;
};

type UploadState =
  | { status: "idle" }
  | { status: "dragging" }
  | { file: UploadFile; progress: number; status: "uploading" }
  | { file: UploadFile; status: "transcribing" }
  | { file: UploadFile; status: "success" }
  | {
      code: UploadErrorCode;
      description: string;
      error: string;
      file: UploadFile;
      status: "error";
    };

export default function AudioUploadCard({
  debugOptions,
}: {
  debugOptions: AudioUploadDebugOptions;
}) {
  const [uploadState, setUploadState] = useState<UploadState>({
    status: "idle",
  });
  const dragDepthRef = useRef(0);
  const invalidFileErrorTimerRef = useRef<number>(null);
  const uploadControllerRef = useRef<AbortController>(null);

  useEffect(() => {
    return () => {
      uploadControllerRef.current?.abort();
      clearInvalidFileErrorTimer();
    };
  }, []);

  function clearInvalidFileErrorTimer() {
    if (invalidFileErrorTimerRef.current !== null) {
      window.clearTimeout(invalidFileErrorTimerRef.current);
      invalidFileErrorTimerRef.current = null;
    }
  }

  function handleDragEnter(event: DragEvent<HTMLElement>) {
    event.preventDefault();

    if (isDropDisabled(uploadState)) {
      dragDepthRef.current = 0;
      event.dataTransfer.dropEffect = "none";
      return;
    }

    dragDepthRef.current += 1;

    if (dragDepthRef.current !== 1) {
      return;
    }

    if (uploadState.status === "idle") {
      setUploadState({ status: "dragging" });
    } else if (
      uploadState.status === "error" &&
      (uploadState.code === "INVALID_FILE_TYPE" ||
        uploadState.code === "UPLOAD_FAILED")
    ) {
      if (uploadState.code === "INVALID_FILE_TYPE") {
        clearInvalidFileErrorTimer();
      }

      uploadControllerRef.current = null;
      setUploadState({ status: "dragging" });
    }
  }

  function handleDragLeave(event: DragEvent<HTMLElement>) {
    event.preventDefault();

    if (isDropDisabled(uploadState)) {
      return;
    }

    dragDepthRef.current -= 1;

    if (dragDepthRef.current <= 0) {
      dragDepthRef.current = 0;
      setUploadState((state) =>
        state.status === "dragging" ? { status: "idle" } : state,
      );
    }
  }

  function handleDragOver(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = isDropDisabled(uploadState)
      ? "none"
      : "copy";
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    dragDepthRef.current = 0;

    if (isDropDisabled(uploadState)) {
      event.dataTransfer.dropEffect = "none";
      return;
    }

    const file = event.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    } else {
      setUploadState((state) =>
        state.status === "dragging" ? { status: "idle" } : state,
      );
    }
  }

  function handleFile(file: File) {
    clearInvalidFileErrorTimer();
    uploadControllerRef.current?.abort();
    const controller = new AbortController();
    const uploadFile: UploadFile = { name: file.name, size: file.size };
    uploadControllerRef.current = controller;

    setUploadState({ file: uploadFile, progress: 0, status: "uploading" });

    simulateAudioUpload(file, {
      failure: debugOptions.uploadError
        ? "upload"
        : debugOptions.transcriptionError
          ? "transcription"
          : undefined,
      signal: controller.signal,
      transcriptionDuration: debugOptions.transcriptionDuration,
      uploadDuration: debugOptions.uploadDuration,
      onUpdate: (update) => {
        if (update.stage === "uploading") {
          setUploadState({
            file: uploadFile,
            progress: update.progress,
            status: "uploading",
          });
        } else {
          setUploadState((state) =>
            state.status === "transcribing"
              ? state
              : { file: uploadFile, status: "transcribing" },
          );
        }
      },
    })
      .then(() => {
        dragDepthRef.current = 0;
        setUploadState({ file: uploadFile, status: "success" });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        const clientError = getClientError(error);
        if (clientError.code === "TRANSCRIPTION_FAILED") {
          dragDepthRef.current = 0;
        }

        setUploadState({
          ...clientError,
          file: uploadFile,
          status: "error",
        });

        if (clientError.code === "INVALID_FILE_TYPE") {
          invalidFileErrorTimerRef.current = window.setTimeout(() => {
            invalidFileErrorTimerRef.current = null;
            uploadControllerRef.current = null;
            setUploadState({ status: "idle" });
          }, INVALID_FILE_ERROR_DURATION);
        }
      });
  }

  function retryTranscription() {
    if (
      uploadState.status !== "error" ||
      uploadState.code !== "TRANSCRIPTION_FAILED"
    ) {
      return;
    }

    const { file } = uploadState;
    const controller = new AbortController();
    uploadControllerRef.current?.abort();
    uploadControllerRef.current = controller;
    setUploadState({ file, status: "transcribing" });

    simulateAudioTranscription({
      failure: debugOptions.transcriptionError,
      signal: controller.signal,
      transcriptionDuration: debugOptions.transcriptionDuration,
    })
      .then(() => {
        dragDepthRef.current = 0;
        setUploadState({ file, status: "success" });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        const clientError = getClientError(error);
        dragDepthRef.current = 0;
        setUploadState({
          ...clientError,
          file,
          status: "error",
        });
      });
  }

  function resetUpload() {
    clearInvalidFileErrorTimer();
    uploadControllerRef.current?.abort();
    uploadControllerRef.current = null;
    setUploadState({ status: "idle" });
  }

  const isBusy =
    uploadState.status === "uploading" || uploadState.status === "transcribing";
  const fileSize = getFileSizeLabel(uploadState);
  const clientError = uploadState.status === "error" ? uploadState : undefined;

  return (
    <section
      aria-labelledby="audio-upload-title"
      aria-busy={isBusy}
      className={`grid h-100 w-75 place-items-center rounded-3xl border text-center transition-colors duration-200 ${getCardClassName(
        uploadState.status,
      )}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div
        className="relative bottom-[6.5%] flex flex-col items-center"
        data-slot="audio-upload-content"
      >
        <AudioUploadIndicator
          mode={uploadState.status}
          progress={
            "progress" in uploadState ? uploadState.progress : undefined
          }
        />
        <div aria-live="polite">
          <AudioUploadInstructions
            description={clientError?.description}
            error={clientError?.error}
            fileSize={fileSize}
            mode={uploadState.status}
          />
        </div>
        <AudioUploadButton
          mode={
            isBusy
              ? "busy"
              : uploadState.status === "success"
                ? "success"
                : isTranscriptionError(uploadState)
                  ? "transcription-error"
                  : uploadState.status === "error"
                    ? "error"
                    : "idle"
          }
          onCancel={resetUpload}
          onContinue={resetUpload}
          onFileSelected={handleFile}
          onGoBack={resetUpload}
          onRetry={retryTranscription}
        />
      </div>
    </section>
  );
}

function isTranscriptionError(state: UploadState): boolean {
  return state.status === "error" && state.code === "TRANSCRIPTION_FAILED";
}

function isDropDisabled(state: UploadState): boolean {
  return state.status === "success" || isTranscriptionError(state);
}

function getClientError(
  error: unknown,
): Pick<
  Extract<UploadState, { status: "error" }>,
  "code" | "description" | "error"
> {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? error.code
      : undefined;
  const description =
    error instanceof Error
      ? error.message
      : "The upload failed. Please try again.";

  switch (code) {
    case "INVALID_FILE_TYPE":
      return { code, description, error: "Invalid file type" };
    case "TRANSCRIPTION_FAILED":
      return { code, description, error: "Transcription failed" };
    default:
      return { code: "UPLOAD_FAILED", description, error: "Upload failed" };
  }
}

function getCardClassName(status: UploadState["status"]) {
  if (status === "success") {
    return "border-solid border-teal-600/50 bg-teal-50";
  }

  if (status === "error") {
    return "border-solid border-red-300 bg-red-50";
  }

  if (status === "uploading" || status === "transcribing") {
    return "border-solid border-zinc-200 bg-zinc-50";
  }

  return status === "dragging"
    ? "border-dashed border-teal-600/50 bg-teal-50"
    : "border-dashed border-zinc-300 bg-zinc-50";
}

function getFileSizeLabel(state: UploadState) {
  if (state.status !== "uploading") {
    return undefined;
  }

  const total = state.file.size / 1_000_000;
  const uploaded = total * (state.progress / 100);

  return `${uploaded.toFixed(1)}/${total.toFixed(1)}Mb`;
}
