export type UploadFile = Pick<File, "name" | "size">;

export type AudioUploadState =
  | { status: "idle" }
  | { status: "dragging" }
  | { status: "uploading"; file: UploadFile; progress: number }
  | { status: "transcribing"; file: UploadFile }
  | { status: "success"; file: UploadFile }
  | {
      status: "error";
      file: UploadFile;
      code: "INVALID_FILE_TYPE" | "TRANSCRIPTION_FAILED" | "UPLOAD_FAILED";
      description: string;
      error: string;
    };
