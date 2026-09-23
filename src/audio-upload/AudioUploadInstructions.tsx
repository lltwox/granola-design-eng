export default function AudioUploadInstructions() {
  return (
    <div
      className="mt-2 flex flex-col items-center"
      data-slot="audio-upload-instructions"
    >
      <h1
        className="text-base/6 font-medium text-zinc-600"
        id="audio-upload-title"
      >
        Upload voice recording
      </h1>
      <p className="mt-0.5 w-55 text-xs/4 text-zinc-600">
        Drag and drop WAV-file
        <br />
        to generate transcription or
      </p>
    </div>
  );
}
