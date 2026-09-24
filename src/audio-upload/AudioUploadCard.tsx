import type { AudioUploadState, UploadFile } from "./types.js";

import { type DragEvent, useEffect, useRef, useState } from "react";

import {
  simulateAudioTranscription,
  simulateAudioUpload,
} from "../../backend.js";

import AudioUploadButton from "./AudioUploadButton.js";
import AudioUploadIndicator from "./AudioUploadIndicator.js";
import AudioUploadInstructions from "./AudioUploadInstructions.js";

const INVALID_FILE_ERROR_DURATION = 3_000;

export default function AudioUploadCard() {
  const [uploadState, setUploadState] = useState<AudioUploadState>({
    status: "idle",
  });
  const activeRequestIdRef = useRef(0);
  const dragDepthRef = useRef(0);
  const invalidFileErrorTimerRef = useRef<number>(null);

  useEffect(() => {
    return () => {
      activeRequestIdRef.current += 1;
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
    if (!event.dataTransfer.types.includes("Files")) {
      return;
    }

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

    clearInvalidFileErrorTimer();
    setUploadState({ status: "dragging" });
  }

  function handleDragLeave(event: DragEvent<HTMLElement>) {
    if (!event.dataTransfer.types.includes("Files")) {
      return;
    }

    event.preventDefault();
    if (isDropDisabled(uploadState)) {
      return;
    }

    dragDepthRef.current -= 1;
    if (dragDepthRef.current > 0) {
      return;
    }

    dragDepthRef.current = 0;
    setUploadState((state) =>
      state.status === "dragging" ? { status: "idle" } : state,
    );
  }

  function handleDragOver(event: DragEvent<HTMLElement>) {
    if (!event.dataTransfer.types.includes("Files")) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = isDropDisabled(uploadState)
      ? "none"
      : "copy";
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    if (!event.dataTransfer.types.includes("Files")) {
      return;
    }

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
    if (isDropDisabled(uploadState)) {
      return;
    }

    clearInvalidFileErrorTimer();
    const requestId = activeRequestIdRef.current + 1;
    const uploadFile: UploadFile = { name: file.name, size: file.size };
    activeRequestIdRef.current = requestId;

    setUploadState({ file: uploadFile, progress: 0, status: "uploading" });

    simulateAudioUpload(file, {
      onUpdate: (update) => {
        if (requestId !== activeRequestIdRef.current) {
          return;
        }

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
        if (requestId !== activeRequestIdRef.current) {
          return;
        }

        dragDepthRef.current = 0;
        setUploadState({ file: uploadFile, status: "success" });
      })
      .catch((error: unknown) => {
        if (requestId !== activeRequestIdRef.current) {
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
            if (requestId === activeRequestIdRef.current) {
              setUploadState({ status: "idle" });
            }
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
    const requestId = activeRequestIdRef.current + 1;
    activeRequestIdRef.current = requestId;
    setUploadState({ file, status: "transcribing" });

    simulateAudioTranscription()
      .then(() => {
        if (requestId !== activeRequestIdRef.current) {
          return;
        }

        dragDepthRef.current = 0;
        setUploadState({ file, status: "success" });
      })
      .catch((error: unknown) => {
        if (requestId !== activeRequestIdRef.current) {
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
    activeRequestIdRef.current += 1;
    setUploadState({ status: "idle" });
  }

  const isBusy =
    uploadState.status === "uploading" || uploadState.status === "transcribing";
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
        className="relative bottom-2.5 flex flex-col items-center"
        data-slot="audio-upload-content"
      >
        <AudioUploadIndicator state={uploadState} />
        <AudioUploadInstructions state={uploadState} />
        <AudioUploadButton
          state={uploadState}
          onFileSelected={handleFile}
          onReset={resetUpload}
          onRetry={retryTranscription}
        />
      </div>
    </section>
  );
}

function isDropDisabled(state: AudioUploadState): boolean {
  return (
    state.status === "uploading" ||
    state.status === "transcribing" ||
    state.status === "success" ||
    isTranscriptionError(state)
  );
}

function isTranscriptionError(state: AudioUploadState): boolean {
  return state.status === "error" && state.code === "TRANSCRIPTION_FAILED";
}

function getClientError(
  error: unknown,
): Pick<
  Extract<AudioUploadState, { status: "error" }>,
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

function getCardClassName(status: AudioUploadState["status"]) {
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
