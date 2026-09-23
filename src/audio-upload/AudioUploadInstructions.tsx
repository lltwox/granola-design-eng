type AudioUploadInstructionsProps = {
  description?: string;
  error?: string;
  fileSize?: string;
  mode:
    "idle" | "dragging" | "uploading" | "transcribing" | "success" | "error";
};

export default function AudioUploadInstructions({
  description,
  error,
  fileSize,
  mode,
}: AudioUploadInstructionsProps) {
  if (mode === "uploading" || mode === "transcribing") {
    return (
      <div
        className="mt-2 flex h-14.5 flex-col items-center"
        data-slot="audio-upload-instructions"
      >
        <h1
          className="text-base/6 font-medium text-zinc-600"
          id="audio-upload-title"
        >
          {mode === "uploading"
            ? "Uploading..."
            : "Generating transcription..."}
        </h1>
        <p className="mt-0.5 h-8 text-xs/4 text-zinc-600">{fileSize}</p>
      </div>
    );
  }

  if (mode === "success") {
    return (
      <div
        className="mt-2 flex h-14.5 flex-col items-center"
        data-slot="audio-upload-instructions"
      >
        <h1
          className="text-base/5 font-medium text-zinc-600"
          id="audio-upload-title"
        >
          Uploaded
          <br />
          successfully!
        </h1>
      </div>
    );
  }

  if (mode === "error") {
    return (
      <div
        className="mt-2 flex h-14.5 flex-col items-center"
        data-slot="audio-upload-instructions"
      >
        <h1
          className="text-base/6 font-medium text-zinc-700"
          id="audio-upload-title"
        >
          {error}
        </h1>
        <p className="mt-0.5 h-8 w-55 text-xs/4 text-zinc-600">{description}</p>
      </div>
    );
  }

  return (
    <div
      className="mt-2 flex h-14.5 flex-col items-center"
      data-slot="audio-upload-instructions"
    >
      <h1
        className="text-base/6 font-medium text-zinc-600"
        id="audio-upload-title"
      >
        Upload voice recording
      </h1>
      <p className="mt-0.5 h-8 w-55 text-xs/4 text-zinc-600">
        Drag and drop WAV-file
        <br />
        to generate transcription or
      </p>
    </div>
  );
}
