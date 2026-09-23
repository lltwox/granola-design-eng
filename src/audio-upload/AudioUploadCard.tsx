import { type DragEvent, useEffect, useRef, useState } from "react";

import { simulateAudioUpload } from "../../backend.js";

import AudioUploadButton from "./AudioUploadButton.js";
import AudioUploadIndicator from "./AudioUploadIndicator.js";
import AudioUploadInstructions from "./AudioUploadInstructions.js";

type UploadFile = Pick<File, "name" | "size">;

type UploadState =
  | { status: "idle" }
  | { status: "dragging" }
  | { file: UploadFile; progress: number; status: "uploading" }
  | { file: UploadFile; progress: number; status: "transcribing" }
  | { file: UploadFile; status: "success" }
  | {
      description: string;
      error: string;
      file: UploadFile;
      status: "error";
    };

export default function AudioUploadCard() {
  const [uploadState, setUploadState] = useState<UploadState>({
    status: "idle",
  });
  const dragDepthRef = useRef(0);
  const uploadControllerRef = useRef<AbortController>(null);

  useEffect(() => {
    return () => uploadControllerRef.current?.abort();
  }, []);

  function handleDragEnter(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    dragDepthRef.current += 1;
    setUploadState((state) =>
      state.status === "idle" ? { status: "dragging" } : state,
    );
  }

  function handleDragLeave(event: DragEvent<HTMLElement>) {
    event.preventDefault();
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
    event.dataTransfer.dropEffect = "copy";
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    dragDepthRef.current = 0;

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
    uploadControllerRef.current?.abort();
    const controller = new AbortController();
    uploadControllerRef.current = controller;

    setUploadState({ file, progress: 0, status: "uploading" });

    simulateAudioUpload(file, {
      signal: controller.signal,
      onProgress: ({ progress, stage }) => {
        if (stage === "uploading") {
          setUploadState({ file, progress, status: "uploading" });
        } else {
          setUploadState({ file, progress, status: "transcribing" });
        }
      },
    })
      .then(() => {
        setUploadState({ file, status: "success" });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setUploadState({ ...getClientError(error), file, status: "error" });
      });
  }

  function resetUpload() {
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
      className={`grid h-[min(400px,calc(100svh-32px))] min-h-90 w-full min-w-65 max-w-75 place-items-center rounded-3xl border text-center transition-colors duration-200 ${getCardClassName(
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
                : uploadState.status === "error"
                  ? "error"
                  : "idle"
          }
          onCancel={resetUpload}
          onContinue={resetUpload}
          onFileSelected={handleFile}
        />
      </div>
    </section>
  );
}

function getClientError(
  error: unknown,
): Pick<Extract<UploadState, { status: "error" }>, "description" | "error"> {
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
      return { description, error: "Invalid file type" };
    case "TRANSCRIPTION_FAILED":
      return { description, error: "Transcription failed" };
    default:
      return { description, error: "Upload failed" };
  }
}

function getCardClassName(status: UploadState["status"]) {
  if (status === "success") {
    return "border-solid border-teal-600/50 bg-teal-50";
  }

  if (status === "error") {
    return "border-solid border-red-300 bg-red-50";
  }

  if (
    status === "uploading" ||
    status === "transcribing" ||
    status === "dragging"
  ) {
    return "border-solid border-zinc-200 bg-zinc-50";
  }

  return status === "dragging"
    ? "border-dashed border-teal-600/50 bg-teal-50"
    : "border-dashed border-zinc-300 bg-zinc-50";
}

function getFileSizeLabel(state: UploadState) {
  if (!("file" in state)) {
    return undefined;
  }

  const total = state.file.size / 1_000_000;
  const progress =
    state.status === "uploading"
      ? state.progress
      : state.status === "transcribing"
        ? 100
        : 0;
  const uploaded = total * (progress / 100);

  return `${uploaded.toFixed(1)}/${total.toFixed(1)}Mb`;
}
