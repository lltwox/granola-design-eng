import { useRef } from "react";

type AudioUploadButtonProps = {
  mode: "idle" | "busy" | "success" | "error" | "transcription-error";
  onCancel: () => void;
  onContinue: () => void;
  onFileSelected: (file: File) => void;
  onGoBack: () => void;
  onRetry: () => void;
};

export default function AudioUploadButton({
  mode,
  onCancel,
  onContinue,
  onFileSelected,
  onGoBack,
  onRetry,
}: AudioUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileSelection(file: File | undefined) {
    if (file) {
      onFileSelected(file);
    }

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  const label =
    mode === "busy"
      ? "Cancel"
      : mode === "success"
        ? "Continue"
        : mode === "transcription-error"
          ? "Retry"
          : "Browse files";

  function handleClick() {
    if (mode === "busy") {
      onCancel();
    } else if (mode === "success") {
      onContinue();
    } else if (mode === "transcription-error") {
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
      {mode !== "transcription-error" ? (
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
        {label}
      </button>
      <div className="mt-[17px] flex h-4 w-full justify-center">
        {mode === "transcription-error" ? (
          <button
            className="group inline-flex animate-[cancel-fade-in_300ms_cubic-bezier(0.16,1,0.3,1)_both] cursor-pointer items-center text-xs/4 font-medium text-zinc-700 transition-colors motion-reduce:animate-none hover:text-red-700 active:text-red-900 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600"
            type="button"
            onClick={onGoBack}
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
