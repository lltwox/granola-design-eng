import { useState } from "react";

import type { AudioUploadDebugOptions } from "./audio-upload/AudioUploadCard.js";
import AudioUploadCard from "./audio-upload/AudioUploadCard.js";

const INFINITE_SLIDER_VALUE = 61;

const initialDebugOptions: AudioUploadDebugOptions = {
  transcriptionDuration: 10_000,
  transcriptionError: false,
  uploadDuration: 3_000,
  uploadError: false,
};

export default function App() {
  const [debugOptions, setDebugOptions] =
    useState<AudioUploadDebugOptions>(initialDebugOptions);

  return (
    <main className="grid min-h-svh content-start justify-items-center gap-6 overflow-auto bg-white p-4 py-8 lg:place-items-center lg:p-4">
      <AudioUploadCard debugOptions={debugOptions} />
      <DebugOverlay value={debugOptions} onChange={setDebugOptions} />
    </main>
  );
}

type DebugOverlayProps = {
  onChange: (value: AudioUploadDebugOptions) => void;
  value: AudioUploadDebugOptions;
};

function DebugOverlay({ onChange, value }: DebugOverlayProps) {
  function setDuration(
    key: "uploadDuration" | "transcriptionDuration",
    seconds: number,
  ) {
    onChange({
      ...value,
      [key]: seconds === INFINITE_SLIDER_VALUE ? Infinity : seconds * 1_000,
    });
  }

  function toggle(key: "uploadError" | "transcriptionError") {
    onChange({ ...value, [key]: !value[key] });
  }

  return (
    <aside
      aria-label="Upload simulator debug controls"
      className="static max-w-[calc(100vw-2rem)] overflow-x-auto rounded-2xl bg-zinc-100 p-3 text-zinc-950 shadow-[0_12px_36px_-14px_rgba(0,0,0,0.28)] lg:fixed lg:right-4 lg:bottom-4"
    >
      <div className="flex min-w-max items-center gap-3">
        <DurationSlider
          id="debug-upload-time"
          label="Upload time"
          value={toSliderValue(value.uploadDuration)}
          onChange={(seconds) => setDuration("uploadDuration", seconds)}
        />
        <DurationSlider
          id="debug-transcribe-time"
          label="Transcribe time"
          value={toSliderValue(value.transcriptionDuration)}
          onChange={(seconds) => setDuration("transcriptionDuration", seconds)}
        />
        <span aria-hidden="true" className="h-10 w-px bg-zinc-300" />
        <ErrorToggle
          active={value.uploadError}
          label="Upload error"
          onClick={() => toggle("uploadError")}
        />
        <ErrorToggle
          active={value.transcriptionError}
          label="Transcribe error"
          onClick={() => toggle("transcriptionError")}
        />
      </div>
    </aside>
  );
}

type DurationSliderProps = {
  id: string;
  label: string;
  onChange: (value: number) => void;
  value: number;
};

function DurationSlider({ id, label, onChange, value }: DurationSliderProps) {
  const isInfinite = value === INFINITE_SLIDER_VALUE;
  const valueLabel = isInfinite ? "Infinite" : `${value}s`;
  const visibleValue = isInfinite ? "∞" : valueLabel;

  return (
    <div className="w-40 shrink-0">
      <div className="flex items-baseline justify-between gap-3">
        <label className="text-xs/4 font-medium text-zinc-700" htmlFor={id}>
          {label}
        </label>
        <output
          aria-label={valueLabel}
          className="text-xs/4 font-semibold text-zinc-950 tabular-nums"
        >
          {visibleValue}
        </output>
      </div>
      <input
        aria-valuetext={valueLabel}
        className="h-11 w-full cursor-pointer accent-teal-400"
        id={id}
        max={INFINITE_SLIDER_VALUE}
        min="1"
        step="1"
        type="range"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}

type ErrorToggleProps = {
  active: boolean;
  label: string;
  onClick: () => void;
};

function ErrorToggle({ active, label, onClick }: ErrorToggleProps) {
  return (
    <button
      aria-pressed={active}
      className={`flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 ${
        active
          ? "bg-red-100 text-red-800"
          : "bg-white text-zinc-700 hover:bg-zinc-50"
      }`}
      type="button"
      onClick={onClick}
    >
      <span
        aria-hidden="true"
        className={`grid size-4 shrink-0 place-items-center rounded border transition-colors ${
          active
            ? "border-red-500 bg-red-500 text-white"
            : "border-zinc-400 bg-white"
        }`}
      >
        {active ? (
          <svg className="size-3" fill="none" viewBox="0 0 12 12">
            <path
              d="m2.5 6 2.25 2.25L9.5 3.5"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.75"
            />
          </svg>
        ) : null}
      </span>
      <span className="text-[11px]/4 font-medium">{label}</span>
    </button>
  );
}

function toSliderValue(duration: number) {
  return Number.isFinite(duration)
    ? Math.round(duration / 1_000)
    : INFINITE_SLIDER_VALUE;
}
