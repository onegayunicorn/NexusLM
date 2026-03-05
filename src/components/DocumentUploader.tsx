import React from 'react';
import { Upload, File, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface DocumentUploaderProps {
  onDocumentUpload: (file: File) => void;
  isDisabled: boolean;
  currentFile: File | null;
}

export default function DocumentUploader({ onDocumentUpload, isDisabled, currentFile }: DocumentUploaderProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onDocumentUpload(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <label className={cn(
        "group relative block cursor-pointer transition-all duration-300",
        isDisabled && "opacity-50 cursor-not-allowed"
      )}>
        <input 
          id="file-upload"
          type="file" 
          className="hidden" 
          onChange={handleFileChange}
          disabled={isDisabled}
          accept=".pdf,.docx,.txt,.md"
        />
        <div className={cn(
          "border-2 border-dashed rounded-2xl p-8 transition-all duration-300 flex flex-col items-center justify-center gap-4 text-center",
          currentFile 
            ? "border-emerald-500/50 bg-emerald-500/5" 
            : "border-zinc-700 group-hover:border-zinc-500 bg-zinc-800/30",
          isDisabled && "group-hover:border-zinc-700"
        )}>
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-transform",
            currentFile ? "bg-emerald-500/20" : "bg-zinc-800",
            !isDisabled && "group-hover:scale-110"
          )}>
            {currentFile ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            ) : (
              <Upload className="w-6 h-6 text-zinc-400" />
            )}
          </div>
          <div>
            <p className="font-medium text-zinc-200">
              {currentFile ? currentFile.name : "Drop your document here"}
            </p>
            <p className="text-xs text-zinc-500 mt-1">PDF, DOCX, TXT, MD up to 50MB</p>
          </div>
        </div>
      </label>
    </div>
  );
}
