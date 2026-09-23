import { useRef } from "react";

type AudioUploadButtonProps = {
  mode: "idle" | "busy" | "success" | "error";
  onCancel: () => void;
  onContinue: () => void;
  onFileSelected: (file: File) => void;
};

export default function AudioUploadButton({
  mode,
  onCancel,
  onContinue,
  onFileSelected,
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
        : "Browse files";

  function handleClick() {
    if (mode === "busy") {
      onCancel();
    } else if (mode === "success") {
      onContinue();
    } else {
      inputRef.current?.click();
    }
  }

  return (
    <div className="mt-3" data-slot="audio-upload-button">
      <input
        ref={inputRef}
        accept=".wav,audio/wav,audio/x-wav"
        className="sr-only"
        onChange={(event) => handleFileSelection(event.target.files?.[0])}
        type="file"
      />
      <button
        className="rounded-lg border-[0.5px] border-black/10 bg-white px-3 py-1 text-sm/5 font-medium text-black shadow-sm transition-colors hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600"
        type="button"
        onClick={handleClick}
      >
        {label}
      </button>
    </div>
  );
}
