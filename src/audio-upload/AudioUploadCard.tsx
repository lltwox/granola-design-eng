import AudioUploadButton from "./AudioUploadButton.js";
import AudioUploadIcon from "./AudioUploadIcon.js";
import AudioUploadInstructions from "./AudioUploadInstructions.js";

export default function AudioUploadCard() {
  return (
    <section
      aria-labelledby="audio-upload-title"
      className="relative h-[min(400px,calc(100svh-32px))] min-h-90 w-full min-w-65 max-w-75 rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 text-center"
    >
      <AudioUploadIcon />

      <div className="absolute inset-x-0 top-54 flex flex-col items-center">
        <AudioUploadInstructions />
        <AudioUploadButton />
      </div>
    </section>
  );
}
