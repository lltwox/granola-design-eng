import type { AudioUploadState } from "./types.js";

type AudioUploadIndicatorProps = {
  state: AudioUploadState;
};

type AudioUploadModeProps = {
  mode: AudioUploadState["status"];
};

type AudioUploadContentProps = AudioUploadModeProps & {
  progress: number;
};

type DecorationShape = {
  height: number;
  radius: number;
  width: number;
  x: number;
  y: number;
};

const IDLE_DECORATION: DecorationShape[] = [
  { height: 176, radius: 56, width: 160, x: 8, y: 0 },
  { height: 144, radius: 40, width: 128, x: 24, y: 16 },
  { height: 112, radius: 24, width: 96, x: 40, y: 32 },
];

const DRAGGING_DECORATION: DecorationShape[] = [
  { height: 140, radius: 38, width: 124, x: 26, y: 18 },
  { height: 120, radius: 28, width: 104, x: 36, y: 28 },
  { height: 101, radius: 18, width: 84, x: 46, y: 37.5 },
];

const PROCESSING_DECORATION: DecorationShape[] = [
  { height: 176, radius: 88, width: 176, x: 0, y: 0 },
  { height: 146, radius: 73, width: 146, x: 15, y: 15 },
  { height: 114, radius: 57, width: 114, x: 31, y: 31 },
];

const PROGRESS_TICK_ANGLES = Array.from(
  { length: 72 },
  (_, index) => index * 5,
);

const TRANSCRIPTION_WAVE_BAR_CLASSNAMES = [
  "h-2.5",
  "h-4",
  "h-6",
  "h-4",
  "h-2.5",
];

export default function AudioUploadIndicator({
  state,
}: AudioUploadIndicatorProps) {
  const mode = state.status;
  const progress = state.status === "uploading" ? state.progress : 0;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative flex size-44 shrink-0 items-center justify-center"
      data-slot="audio-upload-indicator"
    >
      <AudioUploadDecoration mode={mode} />
      <AudioUploadContent mode={mode} progress={progress} />
      <AudioUploadStatusBadge mode={mode} />
    </div>
  );
}

function AudioUploadDecoration({ mode }: AudioUploadModeProps) {
  const isDragging = mode === "dragging";
  const isProcessing = mode === "uploading" || mode === "transcribing";
  const geometry = isProcessing
    ? PROCESSING_DECORATION
    : isDragging
      ? DRAGGING_DECORATION
      : IDLE_DECORATION;

  const strokes = getDecorationStrokes(mode);

  return (
    <svg
      className="absolute inset-0 size-full overflow-visible"
      data-slot="audio-upload-decoration"
      viewBox="0 0 176 176"
    >
      {geometry.map((shape, index) => (
        <rect
          key={index}
          className={`fill-none ${strokes[index]} transition-all duration-500 ease-out motion-reduce:transition-none`}
          height={shape.height}
          rx={shape.radius}
          strokeWidth="0.5"
          vectorEffect="non-scaling-stroke"
          width={shape.width}
          x={shape.x}
          y={shape.y}
        />
      ))}
    </svg>
  );
}

function AudioUploadContent({ mode, progress }: AudioUploadContentProps) {
  return (
    <div
      className={`relative grid place-items-center border-[0.5px] transition-all duration-500 ease-out motion-reduce:transition-none ${getIndicatorContentClassName(mode)}`}
      data-slot="audio-upload-content"
    >
      <AudioUploadWaveform mode={mode} />
      <AudioTranscriptionWave mode={mode} />
      <AudioProcessingTicks mode={mode} progress={progress} />
      <AudioUploadProgress mode={mode} progress={progress} />
      <AudioSuccessMark mode={mode} />
      <AudioErrorMark mode={mode} />
    </div>
  );
}

function AudioUploadWaveform({ mode }: AudioUploadModeProps) {
  const isDragging = mode === "dragging";
  const isVisible = mode === "idle" || isDragging;

  return (
    <span
      className={`absolute h-6 w-5.5 bg-gray-500 mask-[url('/upload-waveform.svg')] mask-contain mask-center mask-no-repeat transition-all duration-200 ease-out motion-reduce:transition-none ${
        isVisible
          ? isDragging
            ? "scale-100 bg-teal-600 opacity-100"
            : "scale-100 opacity-100"
          : "scale-75 opacity-0"
      }`}
    />
  );
}

function AudioTranscriptionWave({ mode }: AudioUploadModeProps) {
  const isVisible = mode === "transcribing";

  return (
    <span
      className={`absolute flex h-6 items-center gap-0.5 transition-all duration-200 ease-out motion-reduce:transition-none ${
        isVisible
          ? "scale-100 opacity-100 delay-200"
          : "scale-75 opacity-0 delay-0"
      }`}
    >
      {TRANSCRIPTION_WAVE_BAR_CLASSNAMES.map((className, index) => (
        <span
          key={index}
          className={`${className} w-0.5 origin-center rounded-full bg-teal-600 motion-reduce:animate-none ${
            isVisible
              ? "animate-[transcription-wave-breathe_2400ms_ease-in-out_infinite]"
              : ""
          }`}
          style={{ animationDelay: `${index * 140}ms` }}
        />
      ))}
    </span>
  );
}

function AudioProcessingTicks({ mode, progress }: AudioUploadContentProps) {
  const isProcessing = mode === "uploading" || mode === "transcribing";
  const isTranscribing = mode === "transcribing";
  const completedTicks = Math.round(
    (Math.min(100, Math.max(0, progress)) / 100) * PROGRESS_TICK_ANGLES.length,
  );

  return (
    <svg
      className={`absolute size-[75.5px] transition-opacity duration-200 motion-reduce:transition-none ${
        isProcessing ? "opacity-100 delay-200" : "opacity-0 delay-0"
      }`}
      viewBox="0 0 75.5 75.5"
    >
      {PROGRESS_TICK_ANGLES.map((angle, index) => (
        <line
          key={angle}
          className={`transition-colors duration-100 motion-reduce:transition-none ${
            isTranscribing
              ? `animate-[transcription-tick-orbit_1200ms_steps(1,end)_infinite] motion-reduce:animate-none ${
                  index % 3 === 0 ? "stroke-teal-600/50" : "stroke-teal-700/20"
                }`
              : index < completedTicks
                ? "stroke-teal-600/50"
                : "stroke-teal-700/20"
          }`}
          style={
            isTranscribing
              ? {
                  animationDelay: `-${((3 - (index % 3)) % 3) * 400}ms`,
                }
              : undefined
          }
          strokeLinecap="round"
          strokeWidth="1.5"
          transform={`rotate(${angle} 37.75 37.75)`}
          x1="37.75"
          x2="37.75"
          y1="0.75"
          y2="4.75"
        />
      ))}
    </svg>
  );
}

function AudioUploadProgress({ mode, progress }: AudioUploadContentProps) {
  const isVisible = mode === "uploading";

  return (
    <span
      className={`absolute text-2xl/7 text-teal-600 tabular-nums transition-all duration-200 ease-out motion-reduce:transition-none ${
        isVisible
          ? "scale-100 opacity-100 delay-200"
          : "scale-75 opacity-0 delay-0"
      }`}
    >
      {String(progress).padStart(2, "0")}%
    </span>
  );
}

function AudioSuccessMark({ mode }: AudioUploadModeProps) {
  const isVisible = mode === "success";

  return (
    <img
      alt=""
      className={`absolute size-8.5 transition-all duration-300 ease-out motion-reduce:transition-none ${
        isVisible
          ? "scale-100 opacity-100 delay-200"
          : "scale-75 opacity-0 delay-0"
      }`}
      src="/upload-check.svg"
    />
  );
}

function AudioErrorMark({ mode }: AudioUploadModeProps) {
  const isVisible = mode === "error";

  return (
    <span
      className={`absolute grid size-8.5 place-items-center rounded-full bg-red-50 text-base/5 font-medium text-red-600 transition-all duration-300 ease-out motion-reduce:transition-none ${
        isVisible
          ? "scale-100 opacity-100 delay-200"
          : "scale-75 opacity-0 delay-0"
      }`}
    >
      !
    </span>
  );
}

function AudioUploadStatusBadge({ mode }: AudioUploadModeProps) {
  const isDragging = mode === "dragging";
  const isProcessing = mode === "uploading" || mode === "transcribing";
  const isTerminal = mode === "success" || mode === "error";
  const arrowClassName =
    "col-start-1 row-start-1 size-4 mask-[url('/upload-arrow.svg')] mask-contain mask-center mask-no-repeat transition-opacity duration-150 ease-out";

  return (
    <span
      className={`absolute left-28 top-30 grid -translate-1/2 place-items-center rounded-full border-[0.5px] transition-all duration-200 ease-out motion-reduce:transition-none ${
        isProcessing || isTerminal
          ? "size-6 scale-75 border-black/0 bg-teal-600 opacity-0 shadow-none"
          : isDragging
            ? "size-6 border-black/20 bg-teal-600 shadow-lg"
            : "size-7 border-black/10 bg-zinc-200 shadow-md"
      }`}
      data-slot="audio-upload-status-badge"
    >
      <span
        className={`${arrowClassName} bg-zinc-500 ${
          isDragging ? "opacity-0" : "opacity-100"
        }`}
      />
      <span
        className={`${arrowClassName} rotate-180 bg-white ${
          isDragging ? "opacity-100" : "opacity-0"
        }`}
      />
    </span>
  );
}

function getDecorationStrokes(mode: AudioUploadState["status"]) {
  switch (mode) {
    case "success":
    case "dragging":
    case "uploading":
    case "transcribing":
      return ["stroke-teal-600/10", "stroke-teal-600/20", "stroke-teal-600/40"];
    case "error":
      return ["stroke-red-600/10", "stroke-red-600/20", "stroke-red-600/40"];
    case "idle":
      return ["stroke-black/5", "stroke-black/10", "stroke-black/20"];
  }
}

function getIndicatorContentClassName(mode: AudioUploadState["status"]) {
  switch (mode) {
    case "uploading":
    case "transcribing":
      return "size-20.5 rounded-[41px] border-teal-700/20 bg-teal-50 shadow-[0_10px_30px_-3px_rgba(13,148,136,0.2),0_4px_20px_-2px_rgba(13,148,136,0.1)]";
    case "success":
      return "h-20 w-16 rounded-lg border-teal-700/20 bg-white shadow-md";
    case "error":
      return "h-20 w-16 rounded-lg border-red-700/20 bg-white shadow-md";
    case "dragging":
      return "h-20 w-16 rounded-lg border-teal-700/20 bg-white shadow-md";
    case "idle":
      return "h-20 w-16 rounded-lg border-black/10 bg-white shadow-lg";
  }
}
