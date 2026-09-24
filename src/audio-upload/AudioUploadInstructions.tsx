import type { AudioUploadState } from "./types.js";

import type { ReactNode } from "react";

import TranscribingDescription from "./TranscribingDescription.js";

type AudioUploadInstructionsProps = {
  state: AudioUploadState;
};

export default function AudioUploadInstructions({
  state,
}: AudioUploadInstructionsProps) {
  return (
    <div aria-live="polite">
      <AudioUploadInstructionsInner state={state} />
    </div>
  );
}

function AudioUploadInstructionsInner({ state }: AudioUploadInstructionsProps) {
  switch (state.status) {
    case "uploading":
      return (
        <Instruction
          title="Uploading…"
          description={getFileSizeLabel(state.file.size, state.progress)}
        />
      );
    case "transcribing":
      return (
        <Instruction
          title="Transcribing…"
          description={<TranscribingDescription />}
        />
      );
    case "success":
      return <Instruction title={"Uploaded\nsuccessfully!"} />;
    case "error":
      return (
        <Instruction title={state.error} description={state.description} />
      );
    case "idle":
    case "dragging":
      return (
        <Instruction
          description={
            <>
              Drag and drop WAV-file
              <br />
              to generate transcription or
            </>
          }
          title="Upload voice recording"
        />
      );
  }
}

function Instruction({
  title,
  description,
}: {
  title: string;
  description?: ReactNode;
}) {
  return (
    <div
      className="mt-2 flex h-14.5 flex-col items-center"
      data-slot="audio-upload-instructions"
    >
      <h1
        className={`whitespace-pre-line font-medium text-zinc-600 ${description === undefined ? "text-base/5" : "text-base/6"}`}
        id="audio-upload-title"
      >
        {title}
      </h1>
      {description !== undefined ? (
        <div className="mt-0.5 h-8 w-55 text-xs/4 text-zinc-600">
          {description}
        </div>
      ) : null}
    </div>
  );
}

function getFileSizeLabel(fileSize: number, progress: number) {
  const total = fileSize / 1_000_000;
  const uploaded = total * (progress / 100);

  return `${uploaded.toFixed(1)}/${total.toFixed(1)}Mb`;
}
