import { type DragEvent, useRef, useState } from "react";

import AudioUploadButton from "./AudioUploadButton.js";
import AudioUploadIndicator from "./AudioUploadIndicator.js";
import AudioUploadInstructions from "./AudioUploadInstructions.js";

export default function AudioUploadCard() {
  const [isDragging, setIsDragging] = useState(false);
  const dragDepthRef = useRef(0);

  function handleDragEnter(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    dragDepthRef.current += 1;
    setIsDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    dragDepthRef.current -= 1;

    if (dragDepthRef.current <= 0) {
      dragDepthRef.current = 0;
      setIsDragging(false);
    }
  }

  function handleDragOver(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    dragDepthRef.current = 0;
    setIsDragging(false);
  }

  return (
    <section
      aria-labelledby="audio-upload-title"
      className={`grid h-[min(400px,calc(100svh-32px))] min-h-90 w-full min-w-65 max-w-75 place-items-center rounded-3xl border border-dashed text-center transition-colors duration-200 ${
        isDragging
          ? "border-teal-600/50 bg-teal-50"
          : "border-zinc-300 bg-zinc-50"
      }`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div
        className="relative bottom-[6.5%] flex flex-col items-center"
        data-slot="audio-upload-content"
      >
        <AudioUploadIndicator isDragging={isDragging} />
        <AudioUploadInstructions />
        <AudioUploadButton />
      </div>
    </section>
  );
}
