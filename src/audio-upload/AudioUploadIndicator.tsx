type AudioUploadIndicatorProps = {
  isDragging: boolean;
  mode: "idle" | "uploading" | "transcribing" | "success" | "error";
  progress?: number;
};

export default function AudioUploadIndicator({
  isDragging,
  mode,
  progress = 0,
}: AudioUploadIndicatorProps) {
  if (mode === "uploading" || mode === "transcribing") {
    return <AudioUploadProgress progress={progress} />;
  }

  if (mode === "success") {
    return <AudioUploadSuccess />;
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative flex h-44 w-40 shrink-0 items-center justify-center"
      data-slot="audio-upload-indicator"
    >
      <AudioUploadDecoration isDragging={isDragging} mode={mode} />
      <AudioUploadWaveform isDragging={isDragging} mode={mode} />
      <AudioUploadStatusBadge isDragging={isDragging} mode={mode} />
    </div>
  );
}

function AudioUploadProgress({ progress }: { progress: number }) {
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress / 100);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative flex size-44 shrink-0 items-center justify-center"
      data-slot="audio-upload-indicator"
    >
      <div className="absolute size-44 rounded-full border-[0.5px] border-teal-600/10" />
      <div className="absolute size-36.5 rounded-full border-[0.5px] border-teal-600/20" />
      <div className="absolute size-28.5 rounded-full border-[0.5px] border-teal-600/40" />
      <div className="relative grid size-20.5 place-items-center rounded-full bg-white shadow-[0_8px_24px_rgba(13,148,136,0.08)]">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 82 82">
          <circle
            className="stroke-teal-100"
            cx="41"
            cy="41"
            fill="none"
            r={radius}
            strokeWidth="3"
          />
          <circle
            className="stroke-teal-600 transition-[stroke-dashoffset] duration-100 ease-linear motion-reduce:transition-none"
            cx="41"
            cy="41"
            fill="none"
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            strokeWidth="3"
          />
        </svg>
        <span className="text-2xl/7 text-teal-600 tabular-nums">
          {progress}%
        </span>
      </div>
    </div>
  );
}

function AudioUploadSuccess() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative flex h-44 w-40 shrink-0 items-center justify-center"
      data-slot="audio-upload-indicator"
    >
      <div className="absolute h-44 w-40 rounded-[56px] border-[0.5px] border-teal-600/10" />
      <div className="absolute h-36 w-32 rounded-[40px] border-[0.5px] border-teal-600/20" />
      <div className="absolute h-28 w-24 rounded-3xl border-[0.5px] border-teal-600/40" />
      <div className="grid h-20 w-16 place-items-center rounded-lg border-[0.5px] border-teal-700/20 bg-white shadow-md">
        <span className="grid size-8.5 place-items-center rounded-full bg-teal-50">
          <span className="size-6 bg-teal-600 mask-[url('/upload-check.svg')] mask-contain mask-center mask-no-repeat" />
        </span>
      </div>
    </div>
  );
}

function AudioUploadDecoration({ isDragging }: AudioUploadIndicatorProps) {
  const ringClassName =
    "col-start-1 row-start-1 border-[0.5px] transition-all duration-200 motion-reduce:transition-none";

  return (
    <div
      className="absolute inset-0 grid place-items-center"
      data-slot="audio-upload-decoration"
    >
      <div
        className={`${ringClassName} ${
          isDragging
            ? "h-35 w-31 rounded-[38px] border-teal-600/10"
            : "h-44 w-40 rounded-[56px] border-black/5"
        }`}
      />
      <div
        className={`${ringClassName} ${
          isDragging
            ? "h-30 w-26 rounded-[28px] border-teal-600/20"
            : "h-36 w-32 rounded-[40px] border-black/10"
        }`}
      />
      <div
        className={`${ringClassName} ${
          isDragging
            ? "h-25.25 w-21 rounded-[18px] border-teal-600/40"
            : "h-28 w-24 rounded-3xl border-black/20"
        }`}
      />
    </div>
  );
}

function AudioUploadWaveform({ isDragging }: AudioUploadIndicatorProps) {
  return (
    <div
      className={`grid h-20 w-16 place-items-center rounded-lg border-[0.5px] bg-white transition-all duration-200 motion-reduce:transition-none ${
        isDragging
          ? "border-teal-700/20 shadow-md"
          : "border-black/10 shadow-lg"
      }`}
      data-slot="audio-upload-waveform"
    >
      <span
        className={`h-6 w-5.5 mask-[url('/upload-waveform.svg')] mask-contain mask-center mask-no-repeat transition-colors duration-200 ${
          isDragging ? "bg-teal-600" : "bg-gray-500"
        }`}
      />
    </div>
  );
}

function AudioUploadStatusBadge({ isDragging }: AudioUploadIndicatorProps) {
  const arrowClassName =
    "col-start-1 row-start-1 size-4 mask-[url('/upload-arrow.svg')] mask-contain mask-center mask-no-repeat transition-opacity duration-150 ease-out";

  return (
    <span
      className={`absolute left-26 top-30 grid -translate-1/2 place-items-center rounded-full border-[0.5px] transition-all duration-200 ease-out motion-reduce:transition-none ${
        isDragging
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
