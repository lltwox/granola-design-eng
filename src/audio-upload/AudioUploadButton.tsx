import { useRef } from "react";

export default function AudioUploadButton() {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="mt-3" data-slot="audio-upload-button">
      <input
        ref={inputRef}
        accept=".wav,audio/wav,audio/x-wav"
        className="sr-only"
        type="file"
      />
      <button
        className="rounded-lg border-[0.5px] border-black/10 bg-white px-3 py-1 text-sm/5 font-medium text-black shadow-sm transition-colors hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600"
        type="button"
        onClick={() => inputRef.current?.click()}
      >
        Browse files
      </button>
    </div>
  );
}
