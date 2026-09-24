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

export default function TranscribingDescription() {
  const [messages] = useState(shuffleTranscriptionMessages);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setMessageIndex((currentIndex) => (currentIndex + 1) % messages.length);
    }, 4000);

    return () => window.clearInterval(interval);
  }, [messages.length]);

  return (
    <span className="relative block size-full">
      {messages.map((message, index) => (
        <span
          aria-hidden={index !== messageIndex}
          className={`absolute inset-0 transition-opacity duration-500 motion-reduce:transition-none ${
            index === messageIndex ? "opacity-100" : "opacity-0"
          }`}
          key={message}
        >
          {message}
        </span>
      ))}
    </span>
  );
}

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
