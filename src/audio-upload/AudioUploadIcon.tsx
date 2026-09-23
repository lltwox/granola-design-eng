export default function AudioUploadIcon() {
  return (
    <div
      aria-hidden="true"
      className="absolute left-1/2 top-8 h-44 w-40 -translate-x-1/2"
    >
      <div className="absolute inset-0 rounded-[56px] border-[0.5px] border-black/5" />
      <div className="absolute inset-x-4 top-4 h-36 rounded-[40px] border-[0.5px] border-black/10" />
      <div className="absolute inset-x-8 top-8 h-28 rounded-3xl border-[0.5px] border-black/20" />

      <div className="absolute left-1/2 top-12 h-20 w-16 -translate-x-1/2 rounded-lg border-[0.5px] border-black/10 bg-white shadow-lg">
        <div className="absolute left-5 top-7 flex h-6 items-center gap-0.75">
          <span className="h-4 w-0.5 rounded-[3px] bg-gray-500" />
          <span className="h-6 w-0.5 rounded-[3px] bg-gray-500" />
          <span className="h-3 w-0.5 rounded-[3px] bg-gray-500" />
          <span className="h-6 w-0.5 rounded-[3px] bg-gray-500" />
          <span className="h-1.5 w-0.5 rounded-[3px] bg-gray-500" />
        </div>
      </div>

      <span className="absolute left-22.5 top-26.5 grid size-7 place-items-center rounded-full bg-zinc-200 shadow-[0_2px_4px_rgba(0,0,0,0.12)]">
        <img alt="" className="size-4" src="/upload-arrow.svg" />
      </span>
    </div>
  );
}
