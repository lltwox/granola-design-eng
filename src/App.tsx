import AudioUploadCard from "./audio-upload/AudioUploadCard.js";
import BackendDebugOverlay from "./BackendDebugOverlay.js";

export default function App() {
  return (
    <main className="grid h-dvh grid-rows-[40fr_auto_60fr] justify-items-center overflow-auto p-4">
      <div className="row-start-2">
        <AudioUploadCard />
      </div>
      <BackendDebugOverlay />
    </main>
  );
}
