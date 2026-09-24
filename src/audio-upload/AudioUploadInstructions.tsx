import { useEffect, useState } from "react";

const TRANSCRIPTION_MESSAGES = [
  "Turning sound waves into words...",
  "Listening very, very carefully...",
  "Convincing the audio to reveal its secrets...",
  "Separating the words from the ums...",
  "Making sense of all that talking...",
  "Chasing down the last few syllables...",
  "Teaching punctuation where to go...",
  "Decoding questionable microphone choices...",
  "Giving every word a proper home...",
  "Almost done pretending this is magic...",
];

function shuffleTranscriptionMessages() {
  const messages = [...TRANSCRIPTION_MESSAGES];

  for (let index = messages.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [messages[index], messages[randomIndex]] = [
      messages[randomIndex],
      messages[index],
    ];
  }

  return messages;
}

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
  const [transcriptionMessages, setTranscriptionMessages] = useState(
    shuffleTranscriptionMessages,
  );
  const [transcriptionMessageIndex, setTranscriptionMessageIndex] = useState(0);

  useEffect(() => {
    if (mode !== "transcribing") {
      setTranscriptionMessageIndex(0);
      return;
    }

    setTranscriptionMessages(shuffleTranscriptionMessages());
    setTranscriptionMessageIndex(0);

    const interval = window.setInterval(() => {
      setTranscriptionMessageIndex(
        (currentIndex) => (currentIndex + 1) % transcriptionMessages.length,
      );
    }, 4000);

    return () => window.clearInterval(interval);
  }, [mode, transcriptionMessages.length]);

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
          {mode === "uploading" ? "Uploading…" : "Transcribing…"}
        </h1>
        {mode === "uploading" ? (
          <p className="mt-0.5 h-8 w-55 text-xs/4 text-zinc-600">{fileSize}</p>
        ) : (
          <div className="relative mt-0.5 h-8 w-55 text-xs/4 text-zinc-600">
            {transcriptionMessages.map((message, index) => (
              <p
                aria-hidden={index !== transcriptionMessageIndex}
                className={`absolute inset-0 transition-opacity duration-500 motion-reduce:transition-none ${
                  index === transcriptionMessageIndex
                    ? "opacity-100"
                    : "opacity-0"
                }`}
                key={message}
              >
                {message}
              </p>
            ))}
          </div>
        )}
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
