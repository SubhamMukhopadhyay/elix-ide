import React, { useState, useRef } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  ExternalLink, 
  Image as ImageIcon
} from 'lucide-react';

interface ImageViewerProps {
  src: string;
  fileName: string;
  filePath?: string;
  fileSize?: number;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  src,
  fileName,
  filePath,
  fileSize
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isFit, setIsFit] = useState<boolean>(true);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    setDimensions({ width: target.naturalWidth, height: target.naturalHeight });
  };

  const handleZoomIn = () => {
    setIsFit(false);
    setZoom(z => Math.min(z * 1.25, 8));
  };

  const handleZoomOut = () => {
    setIsFit(false);
    setZoom(z => Math.max(z / 1.25, 0.1));
  };

  const handleResetZoom = () => {
    setIsFit(false);
    setZoom(1);
    setRotation(0);
  };

  const handleFitToScreen = () => {
    setIsFit(true);
    setZoom(1);
  };

  const handleRotate = () => {
    setRotation(r => (r + 90) % 360);
  };

  const handleOpenExternal = () => {
    if (filePath && window.elix?.openExternal) {
      window.elix.openExternal(filePath);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      setIsFit(false);
      const delta = e.deltaY < 0 ? 1.15 : 0.85;
      setZoom(z => Math.min(Math.max(z * delta, 0.1), 10));
    }
  };

  return (
    <div 
      ref={containerRef}
      onWheel={handleWheel}
      className="flex-1 h-full w-full bg-[#181818] flex flex-col relative select-none overflow-hidden"
    >
      {/* Top Floating Controls Bar */}
      <div className="h-10 px-4 bg-[#1f1f1f]/90 backdrop-blur-md border-b border-[#2b2b2b] flex items-center justify-between text-xs z-20 shrink-0">
        <div className="flex items-center gap-3 text-[var(--ide-text-muted)] text-[11px]">
          <span className="flex items-center gap-1.5 font-medium text-[var(--ide-text)]">
            <ImageIcon size={14} className="text-[#007acc]" />
            {fileName}
          </span>
          {dimensions && (
            <span className="font-mono bg-[#2b2b2b] px-2 py-0.5 rounded text-[10px] text-zinc-300">
              {dimensions.width} × {dimensions.height} px
            </span>
          )}
          {fileSize ? (
            <span className="font-mono text-[10px] text-zinc-400">
              {formatFileSize(fileSize)}
            </span>
          ) : null}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomIn}
            className="p-1.5 hover:bg-[#2b2b2b] hover:text-white rounded text-zinc-400 transition-colors"
            title="Zoom In (Ctrl + Scroll Up)"
          >
            <ZoomIn size={14} />
          </button>
          <span className="font-mono text-[11px] text-zinc-400 min-w-[42px] text-center">
            {isFit ? 'Fit' : `${Math.round(zoom * 100)}%`}
          </span>
          <button
            onClick={handleZoomOut}
            className="p-1.5 hover:bg-[#2b2b2b] hover:text-white rounded text-zinc-400 transition-colors"
            title="Zoom Out (Ctrl + Scroll Down)"
          >
            <ZoomOut size={14} />
          </button>

          <div className="h-4 w-[1px] bg-[#333333] mx-1" />

          <button
            onClick={handleFitToScreen}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              isFit ? 'bg-[#007acc] text-white' : 'text-zinc-400 hover:bg-[#2b2b2b] hover:text-white'
            }`}
            title="Fit to Window"
          >
            Fit
          </button>

          <button
            onClick={handleResetZoom}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              !isFit && zoom === 1 ? 'bg-[#007acc] text-white' : 'text-zinc-400 hover:bg-[#2b2b2b] hover:text-white'
            }`}
            title="100% Size"
          >
            100%
          </button>

          <button
            onClick={handleRotate}
            className="p-1.5 hover:bg-[#2b2b2b] hover:text-white rounded text-zinc-400 transition-colors"
            title="Rotate 90°"
          >
            <RotateCw size={14} />
          </button>

          {filePath && (
            <button
              onClick={handleOpenExternal}
              className="p-1.5 hover:bg-[#2b2b2b] hover:text-white rounded text-zinc-400 transition-colors ml-1"
              title="Open in System Viewer"
            >
              <ExternalLink size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Main Checkered Canvas (VS Code Transparency Grid) */}
      <div 
        className="flex-1 overflow-auto flex items-center justify-center p-6 relative"
        style={{
          backgroundImage: `linear-gradient(45deg, #1d1d1d 25%, transparent 25%), 
                            linear-gradient(-45deg, #1d1d1d 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #1d1d1d 75%), 
                            linear-gradient(-45deg, transparent 75%, #1d1d1d 75%)`,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
          backgroundColor: '#141414'
        }}
      >
        <div 
          className="transition-transform duration-100 ease-out flex items-center justify-center shadow-2xl"
          style={{
            transform: `rotate(${rotation}deg) scale(${isFit ? 1 : zoom})`,
            maxWidth: isFit ? '94%' : 'none',
            maxHeight: isFit ? '94%' : 'none'
          }}
        >
          <img
            ref={imgRef}
            src={src}
            alt={fileName}
            onLoad={handleImageLoad}
            className={`rounded-sm object-contain drop-shadow-md select-none ${
              isFit ? 'max-w-full max-h-[82vh]' : ''
            }`}
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
};
