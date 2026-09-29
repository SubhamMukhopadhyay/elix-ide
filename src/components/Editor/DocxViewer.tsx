import React, { useState, useEffect } from 'react';
import { FileText, ExternalLink, RotateCw, AlertCircle, Loader2 } from 'lucide-react';
import mammoth from 'mammoth';

interface DocxViewerProps {
  src: string;
  fileName: string;
  filePath?: string;
  fileSize?: number;
}

export const DocxViewer: React.FC<DocxViewerProps> = ({
  src,
  fileName,
  filePath,
  fileSize
}) => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const loadDocument = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let arrayBuffer: ArrayBuffer;
      if (src.startsWith('data:')) {
        const base64 = src.split(',')[1];
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        arrayBuffer = bytes.buffer;
      } else {
        const res = await fetch(src);
        arrayBuffer = await res.arrayBuffer();
      }

      const result = await mammoth.convertToHtml({ arrayBuffer });
      setHtmlContent(result.value || '<p class="text-zinc-500 italic">Empty Document</p>');
    } catch (err: any) {
      console.error('Error parsing docx:', err);
      setError(err?.message || 'Failed to parse Word Document');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocument();
  }, [src]);

  const handleOpenExternal = () => {
    if (filePath && window.elix?.openExternal) {
      window.elix.openExternal(filePath);
    }
  };

  return (
    <div className="flex-1 h-full w-full bg-[#181818] flex flex-col select-none overflow-hidden">
      {/* Top Header */}
      <div className="h-10 px-4 bg-[#1f1f1f] border-b border-[#2b2b2b] flex items-center justify-between text-xs shrink-0 z-10">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium text-[var(--ide-text)]">
            <FileText size={14} className="text-blue-400" />
            {fileName}
          </span>
          {fileSize ? (
            <span className="font-mono text-[10px] text-[var(--ide-text-muted)] bg-[#2b2b2b] px-2 py-0.5 rounded">
              {formatFileSize(fileSize)}
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={loadDocument}
            className="p-1.5 hover:bg-[#2b2b2b] hover:text-white rounded text-[var(--ide-text-muted)] transition-colors"
            title="Reload Document"
          >
            <RotateCw size={14} />
          </button>

          {filePath && (
            <button
              onClick={handleOpenExternal}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-[#007acc] hover:bg-[#1188dd] text-white rounded text-xs font-medium transition-colors ml-2 shadow-sm"
              title="Open in Microsoft Word / Office"
            >
              <ExternalLink size={12} />
              <span>Open in Word</span>
            </button>
          )}
        </div>
      </div>

      {/* Document Canvas (A4 Paper Style) */}
      <div className="flex-1 overflow-auto bg-[#141414] p-8 flex justify-center">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center text-zinc-400 gap-2 h-64">
            <Loader2 size={24} className="animate-spin text-[#007acc]" />
            <span className="text-xs">Parsing Document...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-zinc-400 max-w-md">
            <AlertCircle size={36} className="text-amber-400 mb-2" />
            <h4 className="text-sm font-semibold text-white mb-1">Cannot render docx preview</h4>
            <p className="text-xs text-zinc-400 mb-4">{error}</p>
            {filePath && (
              <button
                onClick={handleOpenExternal}
                className="px-4 py-1.5 bg-[#007acc] text-white rounded text-xs font-medium"
              >
                Open with Microsoft Word
              </button>
            )}
          </div>
        ) : (
          <div className="w-full max-w-[820px] bg-white text-slate-900 rounded-sm shadow-2xl p-12 min-h-[90vh] my-4 select-text">
            <div 
              className="prose prose-slate max-w-none text-[15px] leading-relaxed 
                         [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:text-slate-900
                         [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-slate-900
                         [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-slate-900
                         [&_p]:mb-3 [&_p]:text-slate-800
                         [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-3
                         [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-3
                         [&_table]:w-full [&_table]:border-collapse [&_table]:my-4
                         [&_td]:border [&_td]:border-slate-300 [&_td]:p-2
                         [&_th]:border [&_th]:border-slate-300 [&_th]:p-2 [&_th]:bg-slate-100"
              dangerouslySetInnerHTML={{ __html: htmlContent }} 
            />
          </div>
        )}
      </div>
    </div>
  );
};
