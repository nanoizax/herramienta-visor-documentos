import { useRef } from "react";
import { Upload } from "lucide-react";
import { trackToolUsage } from "@/lib/hitCounter";

interface FileDropZoneProps {
  accept: string;
  label: string;
  hint: string;
  onFile: (file: File) => void;
  /** Si se pasa, permite elegir/soltar varios archivos a la vez (ademas de onFile por cada uno). */
  multiple?: boolean;
  onFiles?: (files: File[]) => void;
  /** Id de la herramienta (ver src/data/tools.ts). Si se pasa, cuenta el uso al elegir archivo. */
  toolId?: string;
}

const FileDropZone = ({ accept, label, hint, onFile, multiple, onFiles, toolId }: FileDropZoneProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileList = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    if (toolId) trackToolUsage(toolId);
    if (multiple && onFiles) {
      onFiles(Array.from(list));
    } else {
      onFile(list[0]);
    }
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        handleFileList(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      className="border-2 border-dashed border-neutral-700 rounded-xl py-16 px-6 text-center cursor-pointer hover:border-neutral-500 transition-colors"
    >
      <Upload className="w-10 h-10 text-neutral-500 mx-auto mb-4" />
      <p className="text-white font-medium mb-2">{label}</p>
      <p className="text-neutral-500 text-sm">{hint}</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFileList(e.target.files)}
      />
    </div>
  );
};

export default FileDropZone;
