type AudioUploadIndicatorProps = {
  isDragging: boolean;
};

export default function AudioUploadIndicator({
  isDragging,
}: AudioUploadIndicatorProps) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative flex h-44 w-40 shrink-0 items-center justify-center"
      data-slot="audio-upload-indicator"
    >
      <AudioUploadDecoration isDragging={isDragging} />
      <AudioUploadWaveform isDragging={isDragging} />
      <AudioUploadStatusBadge isDragging={isDragging} />
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
