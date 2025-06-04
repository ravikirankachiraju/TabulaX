import React, { useState } from "react";
import { Loader2, FileText } from "lucide-react";

type FileType = "source" | "target" | "input";
type SamplesMap = { [key: string]: string[] };

interface FileUploaderProps {
  type: FileType;
  setColumns: (columns: string[]) => void;
  setSamples: React.Dispatch<React.SetStateAction<{ source: SamplesMap; target: SamplesMap; input: SamplesMap }>>;
}

const FileUploader: React.FC<FileUploaderProps> = ({ type, setColumns, setSamples }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileType", type);
    setIsLoading(true);
    setFileName(file.name);

    try {
      const response = await fetch(`http://localhost:5000/upload-${type}`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setColumns(data.columns);
      setSamples((prev) => ({ ...prev, [type]: data.samples }));
    } catch (error) {
      console.error(`Error uploading ${type} file:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) handleFile(uploadedFile);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) handleFile(droppedFile);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  };

  return (
    <div className="my-4">
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        Upload {type.charAt(0).toUpperCase() + type.slice(1)} File
      </label>

      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
        className={`relative w-full border-2 ${
          isDragging ? "border-blue-500 bg-blue-50" : "border-dashed border-slate-300"
        } rounded-xl p-6 text-center transition-all duration-300 cursor-pointer group`}
      >
        <p className="text-slate-500 text-sm mb-2 group-hover:text-slate-700">
          Drag & drop your CSV/XLSX file here, or click to select
        </p>

        <input
          type="file"
          accept=".csv,.xlsx"
          onChange={handleFileUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        {isLoading ? (
          <div className="flex justify-center mt-2 text-blue-500 animate-spin">
            <Loader2 size={20} />
          </div>
        ) : fileName ? (
          <div className="mt-3 flex items-center justify-center gap-2 text-sm text-slate-600">
            <FileText size={18} />
            <span className="truncate max-w-xs">{fileName}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default FileUploader;
