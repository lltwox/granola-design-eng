import type { AudioUploadState } from "./types.js";

import { useRef } from "react";

type AudioUploadButtonProps = {
  state: AudioUploadState;
  onFileSelected: (file: File) => void;
  onReset: () => void;
  onRetry: () => void;
};

export default function AudioUploadButton({
  state,
  onFileSelected,
  onReset,
  onRetry,
}: AudioUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const isProcessing =
    state.status === "uploading" || state.status === "transcribing";
  const isSuccess = state.status === "success";
  const isTranscriptionError =
    state.status === "error" && state.code === "TRANSCRIPTION_FAILED";

  function handleFileSelection(file: File | undefined) {
    if (file) {
      onFileSelected(file);
    }

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleClick() {
    if (isProcessing || isSuccess) {
      onReset();
    } else if (isTranscriptionError) {
      onRetry();
    } else {
      inputRef.current?.click();
    }
  }

  return (
    <div
      className="mt-3 flex flex-col items-center"
      data-slot="audio-upload-button"
    >
      {!isTranscriptionError ? (
        <input
          ref={inputRef}
          accept=".wav,audio/wav,audio/x-wav"
          className="sr-only"
          onChange={(event) => handleFileSelection(event.target.files?.[0])}
          type="file"
        />
      ) : null}

      <button
        className="rounded-lg border-[0.5px] border-black/10 bg-white px-3 py-1 text-sm/5 font-medium text-black shadow-sm transition-colors hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600"
        type="button"
        onClick={handleClick}
      >
        {getButtonLabel(state)}
      </button>

      <div className="mt-4.25 flex h-4 w-full justify-center">
        {isTranscriptionError ? (
          <button
            className="group inline-flex animate-[cancel-fade-in_300ms_cubic-bezier(0.16,1,0.3,1)_both] cursor-pointer items-center text-xs/4 font-medium text-zinc-700 transition-colors motion-reduce:animate-none hover:text-red-700 active:text-red-900 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600"
            type="button"
            onClick={onReset}
          >
            <span className="border-b border-dashed border-zinc-500 transition-colors group-hover:border-red-500 group-active:border-red-700">
              Cancel
            </span>
          </button>
        ) : null}
      </div>
    </div>
  );
}

function getButtonLabel(state: AudioUploadState) {
  if (state.status === "uploading" || state.status === "transcribing") {
    return "Cancel";
  }

  if (state.status === "success") {
    return "Continue";
  }

  if (state.status === "error" && state.code === "TRANSCRIPTION_FAILED") {
    return "Retry";
  }

  return "Browse files";
}
