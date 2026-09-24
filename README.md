# Audio upload

Requires Node.js 20.19+ or 22.12+ and npm.

## Run

```sh
npm ci
npm run dev
```

Open [http://localhost:5173/](http://localhost:5173/) to see the component.

## Test the states

Upload a WAV file or drag one onto the card. The bottom-right debug overlay is separate from the upload component. It controls only the simulated backend: set upload and transcription times or turn on either error toggle.


## Added states/features:
- **Transcribing state:** Appears after the upload finishes.
- **Invalid file:** Drop another file onto the error card, or wait 3 seconds for it to reset.
- **Upload failed:** Drop another file onto the error card, or use **Browse files**.
- **Transcription failed:** Use **Retry** to transcribe the uploaded file again, or **Cancel** to upload a new file.

If a file passes client validation but transcription finds it is not a valid WAV, it would show the invalid file state. The simulator does not cover that case.
