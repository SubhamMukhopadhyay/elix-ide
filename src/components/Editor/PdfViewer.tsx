import React, { useState } from 'react';
import { FileText, ExternalLink, RotateCw, Download, AlertCircle } from 'lucide-react';

interface PdfViewerProps {
  src: string;
  fileName: string;
  filePath?: string;
  fileSize?: number;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  src,
  fileName,
  filePath,
  fileSize
}) => {
  const [reloadKey, setReloadKey] = useState<number>(0);
  const [hasError, setHasError] = useState<boolean>(false);

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleOpenExternal = () => {
    if (filePath && window.elix?.openExternal) {
      window.elix.openExternal(filePath);
    }
  };

  return (
    <div className="flex-1 h-full w-full bg-[#1e1e1e] flex flex-col select-none overflow-hidden">
      {/* Top Header */}
      <div className="h-10 px-4 bg-[#252526] border-b border-[#2b2b2b] flex items-center justify-between text-xs shrink-0 z-10">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium text-[var(--ide-text)]">
            <FileText size={14} className="text-red-400" />
            {fileName}
          </span>
          {fileSize ? (
            <span className="font-mono text-[10px] text-[var(--ide-text-muted)] bg-[var(--ide-bg)] px-2 py-0.5 rounded">
              {formatFileSize(fileSize)}
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setReloadKey(k => k + 1)}
            className="p-1.5 hover:bg-[#333333] hover:text-white rounded text-[var(--ide-text-muted)] transition-colors"
            title="Reload PDF"
          >
            <RotateCw size={14} />
          </button>

          {filePath && (
            <button
              onClick={handleOpenExternal}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-[#007acc] hover:bg-[#1188dd] text-white rounded text-xs font-medium transition-colors ml-2 shadow-sm"
              title="Open in default system PDF reader (Acrobat, Edge, Chrome)"
            >
              <ExternalLink size={12} />
              <span>Open in System Reader</span>
            </button>
          )}
        </div>
      </div>

      {/* PDF Viewport */}
      <div className="flex-1 w-full h-full relative bg-[#2a2a2a] overflow-hidden">
        {hasError ? (
          <div className="flex-1 h-full flex flex-col items-center justify-center p-6 text-center text-zinc-400">
            <AlertCircle size={40} className="text-red-400 mb-3" />
            <h3 className="text-sm font-semibold text-white mb-1">Unable to preview PDF directly</h3>
            <p className="text-xs text-zinc-400 mb-4 max-w-sm">
              This document can be opened seamlessly with your system default PDF reader.
            </p>
            {filePath && (
              <button
                onClick={handleOpenExternal}
                className="px-4 py-2 bg-[#007acc] hover:bg-[#1188dd] text-white rounded text-xs font-semibold shadow-md transition-all"
              >
                Open in Default PDF App
              </button>
            )}
          </div>
        ) : (
          <iframe
            key={reloadKey}
            src={src}
            title={fileName}
            onError={() => setHasError(true)}
            className="w-full h-full border-none bg-[#323639]"
          />
        )}
      </div>
    </div>
  );
};
