import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  Smartphone, 
  RotateCw, 
  QrCode, 
  X, 
  Wifi, 
  Battery, 
  Signal, 
  ExternalLink,
  Info,
  Radio,
  Lock,
  ChevronLeft,
  ChevronRight,
  Share2,
  Bookmark,
  Layers,
  MoreVertical,
  Globe,
  FileCode
} from 'lucide-react';

interface MobilePreviewModalProps {
  onClose: () => void;
  devServerUrl?: string;
  activeProject?: any;
  activeTab?: {
    id: string;
    name: string;
    content: string;
    path?: string;
  };
}

export const MobilePreviewModal: React.FC<MobilePreviewModalProps> = ({
  onClose,
  devServerUrl = 'http://localhost:5173',
  activeProject,
  activeTab
}) => {
  const [lanIp, setLanIp] = useState<string>('127.0.0.1');
  const [protocol, setProtocol] = useState<'server' | 'html' | 'expo'>('server');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [deviceModel, setDeviceModel] = useState<'iphone' | 'pixel'>('iphone');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [urlInput, setUrlInput] = useState<string>(devServerUrl);
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<string>('9:41');

  const isHtmlAvailable = !!(activeTab && activeTab.name.toLowerCase().endsWith('.html'));

  // Update clock every minute
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours % 12 || 12}:${minutes}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  // 1. Get real LAN Wi-Fi IP from Electron
  useEffect(() => {
    if (window.elix?.getLanIp) {
      window.elix.getLanIp().then(ip => {
        if (ip && ip !== '127.0.0.1') {
          setLanIp(ip);
        }
      });
    }
  }, []);

  // Compute active connection URL based on mode
  const portMatch = urlInput.match(/:(\d+)/);
  const port = portMatch ? portMatch[1] : '5173';

  const activeLanUrl = protocol === 'expo' 
    ? `exp://${lanIp}:8081` 
    : `http://${lanIp}:${port}`;

  // 2. Generate QR code for mobile scanning
  useEffect(() => {
    const target = protocol === 'expo' ? `exp://${lanIp}:8081` : activeLanUrl;
    QRCode.toDataURL(target, { width: 170, margin: 1 })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error(err));
  }, [protocol, activeLanUrl, lanIp]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setIframeKey(k => k + 1);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleOpenBrowser = () => {
    const target = protocol === 'html' && activeTab?.path ? activeTab.path : urlInput;
    window.elix?.openExternal?.(target);
  };

  // Helper to build HTML document with base URL for relative assets
  const getRenderedHtml = (): string => {
    if (!activeTab || typeof activeTab.content !== 'string') return '';
    let content = activeTab.content;
    const filePath = activeTab.path || '';
    if (filePath) {
      const lastSlash = Math.max(filePath.lastIndexOf('/'), filePath.lastIndexOf('\\'));
      const dirPath = lastSlash !== -1 ? filePath.substring(0, lastSlash) : '';
      if (dirPath) {
        const normalizedDir = dirPath.replace(/\\/g, '/');
        const baseHref = `file:///${normalizedDir.replace(/^\/+/, '')}/`;
        const baseTag = `<base href="${baseHref}">`;
        const metaViewport = `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">`;
        if (content.includes('<head>')) {
          content = content.replace('<head>', `<head>\n  ${baseTag}\n  ${metaViewport}`);
        } else if (content.match(/<head[^>]*>/i)) {
          content = content.replace(/(<head[^>]*>)/i, `$1\n  ${baseTag}\n  ${metaViewport}`);
        } else if (content.includes('<html>')) {
          content = content.replace('<html>', `<html><head>${baseTag}${metaViewport}</head>`);
        } else if (content.trim().length > 0) {
          content = `<!DOCTYPE html><html><head>${baseTag}${metaViewport}<meta charset="utf-8"></head><body>${content}</body></html>`;
        }
      }
    }
    return content;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-in fade-in duration-200 font-sans">
      <div className="w-full max-w-4xl bg-[var(--ide-sidebar-bg)] border border-[var(--ide-border)] rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[92vh] text-[var(--ide-text)]">
        
        {/* Left Side: Controls & Physical Device Bridge */}
        <div className="w-full md:w-80 p-5 bg-[var(--ide-sidebar-bg)] border-r border-[var(--ide-border)] flex flex-col justify-between shrink-0 overflow-y-auto">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <Smartphone size={16} className="text-[#007acc]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--ide-text)]">
                  Mobile Simulator
                </h2>
              </div>
            </div>
            <p className="text-[11px] text-[var(--ide-text-muted)] mb-4">
              Real device viewport & wireless QR bridge for iOS & Android.
            </p>

            {/* Viewport Source Mode */}
            <div className="mb-4">
              <div className="text-[10px] text-[var(--ide-text-muted)] font-semibold uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>VIEWPORT SOURCE</span>
                <span className="text-emerald-400 flex items-center gap-1 font-mono text-[10px]">
                  <Radio size={9} className="animate-pulse" /> {lanIp}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 bg-[var(--ide-panel-bg)] p-1 rounded-lg border border-[var(--ide-border)] text-[10px]">
                <button
                  onClick={() => setProtocol('server')}
                  className={`py-1.5 rounded font-medium transition-colors ${
                    protocol === 'server' ? 'bg-[#007acc] text-white shadow-xs' : 'text-[var(--ide-text-muted)] hover:text-white'
                  }`}
                  title="Dev Server (Vite / Next / React)"
                >
                  Dev Server
                </button>
                <button
                  onClick={() => setProtocol('html')}
                  disabled={!isHtmlAvailable}
                  className={`py-1.5 rounded font-medium transition-colors ${
                    protocol === 'html' 
                      ? 'bg-[#007acc] text-white shadow-xs' 
                      : isHtmlAvailable 
                      ? 'text-[var(--ide-text-muted)] hover:text-white' 
                      : 'text-[var(--ide-text-muted)]/40 cursor-not-allowed'
                  }`}
                  title={isHtmlAvailable ? `Active: ${activeTab?.name}` : 'No HTML file open'}
                >
                  HTML File
                </button>
                <button
                  onClick={() => setProtocol('expo')}
                  className={`py-1.5 rounded font-medium transition-colors ${
                    protocol === 'expo' ? 'bg-[#007acc] text-white shadow-xs' : 'text-[var(--ide-text-muted)] hover:text-white'
                  }`}
                  title="Expo Go App Bridge (exp://)"
                >
                  Expo Go
                </button>
              </div>
            </div>

            {/* Server URL Input */}
            {protocol === 'server' && (
              <div className="mb-4">
                <label className="text-[10px] text-[var(--ide-text-muted)] uppercase tracking-wider font-semibold block mb-1">
                  Local Dev Server URL
                </label>
                <div className="flex items-center gap-1 bg-[var(--ide-input-bg)] border border-[var(--ide-border)] rounded-lg px-2.5 py-1.5 focus-within:border-[#007acc]">
                  <Globe size={13} className="text-[#007acc] shrink-0" />
                  <input
                    type="text"
                    value={urlInput}
                    onChange={e => setUrlInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleRefresh();
                    }}
                    placeholder="http://localhost:5173"
                    className="w-full bg-transparent text-xs text-[var(--ide-text)] font-mono outline-none"
                  />
                  <button
                    onClick={handleRefresh}
                    className="p-1 hover:bg-[var(--ide-hover-bg)] rounded text-[var(--ide-text-muted)] hover:text-[var(--ide-text)]"
                    title="Reload Dev Server"
                  >
                    <RotateCw size={11} className={isRefreshing ? 'animate-spin' : ''} />
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-[var(--ide-text-muted)]">Presets:</span>
                  {[5173, 3000, 8080, 8081].map(p => (
                    <button
                      key={p}
                      onClick={() => {
                        setUrlInput(`http://localhost:${p}`);
                        setIframeKey(k => k + 1);
                      }}
                      className="px-1.5 py-0.5 bg-[var(--ide-panel-bg)] hover:bg-[var(--ide-hover-bg)] border border-[var(--ide-border)] rounded text-[10px] text-[var(--ide-text-muted)] hover:text-[var(--ide-text)] transition-colors"
                    >
                      :{p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Active HTML File Info */}
            {protocol === 'html' && (
              <div className="mb-4 p-2.5 bg-[var(--ide-panel-bg)] rounded-lg border border-[var(--ide-border)] text-xs flex items-center gap-2">
                <FileCode size={15} className="text-amber-400 shrink-0" />
                <div className="truncate">
                  <div className="text-[11px] font-medium text-[var(--ide-text)] truncate">
                    {activeTab?.name || 'index.html'}
                  </div>
                  <div className="text-[10px] text-[var(--ide-text-muted)]">Live HTML with mobile meta viewport</div>
                </div>
              </div>
            )}

            {/* Device Switcher */}
            <div className="mb-4 space-y-1.5">
              <label className="text-[10px] text-[var(--ide-text-muted)] uppercase tracking-wider block font-semibold">
                Device Frame
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => setDeviceModel('iphone')}
                  className={`py-2 px-3 rounded-lg border text-center font-medium transition-all ${
                    deviceModel === 'iphone'
                      ? 'bg-[#007acc] text-white border-[#007acc] shadow-sm font-semibold'
                      : 'bg-[var(--ide-input-bg)] text-[var(--ide-text-muted)] border-[var(--ide-border)] hover:bg-[var(--ide-hover-bg)] hover:text-[var(--ide-text)]'
                  }`}
                >
                  iPhone 16 Pro
                </button>
                <button
                  onClick={() => setDeviceModel('pixel')}
                  className={`py-2 px-3 rounded-lg border text-center font-medium transition-all ${
                    deviceModel === 'pixel'
                      ? 'bg-[#007acc] text-white border-[#007acc] shadow-sm font-semibold'
                      : 'bg-[var(--ide-input-bg)] text-[var(--ide-text-muted)] border-[var(--ide-border)] hover:bg-[var(--ide-hover-bg)] hover:text-[var(--ide-text)]'
                  }`}
                >
                  Pixel 8 Pro
                </button>
              </div>
            </div>

            {/* QR Code Bridge for Physical Phone */}
            <div className="p-3 bg-[var(--ide-panel-bg)] rounded-lg border border-[var(--ide-border)] text-center flex flex-col items-center shadow-inner">
              <span className="text-xs font-semibold text-[var(--ide-text)] mb-2 flex items-center gap-1.5">
                <QrCode size={13} className="text-[#007acc]" />
                <span>{protocol === 'expo' ? 'Scan in Expo Go App' : 'Scan to Test on Real Phone'}</span>
              </span>
              
              {qrDataUrl && (
                <div className="p-2 bg-white rounded-lg shadow-md my-1">
                  <img src={qrDataUrl} alt="Mobile QR Code" className="w-28 h-28" />
                </div>
              )}

              <div className="w-full mt-2 p-1.5 bg-[var(--ide-input-bg)] rounded border border-[var(--ide-border)] text-[10px] font-mono text-cyan-400 break-all select-all">
                {protocol === 'expo' ? `exp://${lanIp}:8081` : activeLanUrl}
              </div>

              <div className="mt-2 text-[10px] text-[var(--ide-text-muted)] leading-relaxed text-left flex items-start gap-1">
                <Info size={12} className="shrink-0 text-[#007acc] mt-0.5" />
                <span>Phone must be connected to the same Wi-Fi ({lanIp}).</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--ide-border)] flex items-center justify-between mt-4">
            <button
              onClick={handleOpenBrowser}
              className="flex items-center gap-1.5 text-xs text-[var(--ide-text-muted)] hover:text-[var(--ide-text)] transition-colors"
              title="Open in System Browser"
            >
              <ExternalLink size={12} />
              <span>Open in Browser</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-[var(--ide-input-bg)] border border-[var(--ide-border)] hover:bg-[var(--ide-hover-bg)] text-xs text-[var(--ide-text)] rounded transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>

        {/* Right Side: Realistic Smartphone Frame with Live Mobile Browser Viewport */}
        <div className="flex-1 p-6 flex items-center justify-center bg-[#07090e] overflow-hidden">
          
          {/* ============================================================== */}
          {/* 1. IPHONE 16 PRO FRAME (Seamless Dynamic Island, Safari Viewport) */}
          {/* ============================================================== */}
          {deviceModel === 'iphone' && (
            <div className="relative w-[310px] h-[620px] bg-[#1a191f] rounded-[52px] p-2.5 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.95)] border-[5.5px] border-[#31303b] ring-1 ring-black/90 transition-all duration-300">
              {/* iPhone Left Buttons: Action Button + Volume Up + Volume Down */}
              <div className="absolute -left-[8.5px] top-[100px] w-[3px] h-[19px] bg-[#4a4955] rounded-l" title="Action Button" />
              <div className="absolute -left-[8.5px] top-[132px] w-[3px] h-[38px] bg-[#4a4955] rounded-l" title="Volume Up" />
              <div className="absolute -left-[8.5px] top-[180px] w-[3px] h-[38px] bg-[#4a4955] rounded-l" title="Volume Down" />

              {/* iPhone Right Buttons: Power + Camera Control */}
              <div className="absolute -right-[8.5px] top-[135px] w-[3px] h-[50px] bg-[#4a4955] rounded-r" title="Side Button" />
              <div className="absolute -right-[8.5px] top-[280px] w-[2.5px] h-[38px] bg-[#292830] border-l border-[#4a4955] rounded-r" title="Camera Control" />

              {/* Screen */}
              <div className="w-full h-full bg-white rounded-[44px] overflow-hidden flex flex-col relative text-black select-none">
                
                {/* Genuine Pitch-Black Dynamic Island (Apple iPhone 16 / 17 Pro Style) */}
                <div 
                  className="absolute top-2.5 left-1/2 -translate-x-1/2 w-[100px] h-[28px] bg-black rounded-full z-40 flex items-center justify-between px-3 shadow-[0_2px_8px_rgba(0,0,0,0.8)] pointer-events-none select-none"
                  title="Dynamic Island"
                >
                  {/* Subtle TrueDepth Camera Lens (Left) */}
                  <div className="w-2.5 h-2.5 rounded-full bg-[#080d1a] border border-[#1e1e28] flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-[#152238]" />
                  </div>
                  {/* Face ID / Ambient Light Sensor (Right) */}
                  <div className="w-2 h-2 rounded-full bg-[#080a12] border border-[#141620]" />
                </div>

                {/* iOS Status Bar */}
                <div className="h-10 px-6 pt-2 flex items-center justify-between text-[11px] text-black font-semibold z-30 bg-transparent shrink-0">
                  <span className="tracking-tight font-semibold pl-1 text-[12px]">{currentTime}</span>
                  <div className="flex items-center gap-1.5 pr-1 text-black">
                    <div className="flex items-end gap-[1.5px] h-2.5">
                      <div className="w-[2.5px] h-[3px] bg-black rounded-[0.5px]" />
                      <div className="w-[2.5px] h-[5px] bg-black rounded-[0.5px]" />
                      <div className="w-[2.5px] h-[7px] bg-black rounded-[0.5px]" />
                      <div className="w-[2.5px] h-[9px] bg-black rounded-[0.5px]" />
                    </div>
                    <span className="text-[10px] font-bold">5G</span>
                    <div className="flex items-center">
                      <div className="w-5 h-2.5 border-[1.5px] border-black rounded-[3px] p-[1px] flex items-center">
                        <div className="w-full h-full bg-black rounded-[1px]" />
                      </div>
                      <div className="w-[1px] h-1 bg-black rounded-r-[1px]" />
                    </div>
                  </div>
                </div>

                {/* Main Viewport Content (Iframe / Real Webpage) */}
                <div className="flex-1 w-full bg-white relative overflow-hidden flex flex-col">
                  {protocol === 'html' && activeTab ? (
                    <iframe
                      key={`html-${iframeKey}`}
                      srcDoc={getRenderedHtml() || '<!DOCTYPE html><html><body><div style="font-family:sans-serif;color:#888;padding:24px;text-align:center;">(Empty HTML Document)</div></body></html>'}
                      title="iPhone Safari Viewport"
                      className="w-full h-full border-none bg-white"
                      sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
                    />
                  ) : (
                    <iframe
                      key={`server-${iframeKey}`}
                      src={urlInput}
                      title="iPhone Safari Viewport"
                      className="w-full h-full border-none bg-white"
                      sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
                    />
                  )}
                </div>

                {/* iOS Mobile Safari Address Bar & Toolbar (Real iOS 18 Design) */}
                <div className="bg-[#f2f2f6] border-t border-[#d1d1d6] shrink-0 z-30 pt-1.5 pb-3 px-3">
                  {/* Floating Safari URL Pill */}
                  <div className="h-8 bg-white border border-[#c6c6c8] rounded-xl flex items-center justify-between px-3 shadow-xs">
                    <span className="text-[11px] font-serif font-bold text-neutral-600">AA</span>
                    <div className="flex items-center gap-1 text-[11px] text-neutral-800 font-medium truncate max-w-[170px]">
                      <Lock size={10} className="text-neutral-500 shrink-0" />
                      <span className="truncate">
                        {protocol === 'html' ? (activeTab?.name || 'index.html') : urlInput.replace(/^https?:\/\//, '')}
                      </span>
                    </div>
                    <button 
                      onClick={handleRefresh}
                      className="text-neutral-500 hover:text-black p-0.5 rounded transition-colors"
                      title="Reload Page"
                    >
                      <RotateCw size={11} className={isRefreshing ? 'animate-spin' : ''} />
                    </button>
                  </div>

                  {/* Safari Bottom Actions Toolbar */}
                  <div className="flex items-center justify-between px-4 pt-2 text-[#007aff]">
                    <ChevronLeft size={17} className="cursor-pointer hover:opacity-75" />
                    <ChevronRight size={17} className="cursor-pointer opacity-30" />
                    <button onClick={handleOpenBrowser} className="hover:opacity-75" title="Open in Browser">
                      <Share2 size={15} />
                    </button>
                    <Bookmark size={15} className="cursor-pointer hover:opacity-75" />
                    <div className="w-4 h-4 border border-[#007aff] rounded-xs flex items-center justify-center text-[9px] font-bold cursor-pointer hover:opacity-75">
                      1
                    </div>
                  </div>

                  {/* iOS Home Indicator Bar */}
                  <div className="h-5 flex items-center justify-center pt-2">
                    <div className="w-32 h-[4.5px] bg-black/85 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 2. GOOGLE PIXEL 8 PRO FRAME (Material You, Chrome Mobile Viewport) */}
          {/* ============================================================== */}
          {deviceModel === 'pixel' && (
            <div className="relative w-[310px] h-[620px] bg-[#14151a] rounded-[38px] p-2.5 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.95)] border-[5.5px] border-[#383a45] ring-1 ring-black/90 transition-all duration-300">
              {/* Pixel Top Speaker Slit */}
              <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-14 h-[2px] bg-[#272930] rounded-full z-40" />

              {/* Pixel Right Buttons (Power ABOVE Volume) */}
              <div className="absolute -right-[8.5px] top-[110px] w-[3px] h-[32px] bg-[#535764] rounded-r" title="Power Button" />
              <div className="absolute -right-[8.5px] top-[160px] w-[3px] h-[68px] bg-[#535764] rounded-r" title="Volume Rocker" />

              {/* Screen */}
              <div className="w-full h-full bg-white rounded-[30px] overflow-hidden flex flex-col relative text-black select-none">
                
                {/* Centered Android Punch-hole Camera */}
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-black rounded-full border border-neutral-800 z-40 flex items-center justify-center shadow-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1b2538]" />
                </div>

                {/* Android Material You Status Bar */}
                <div className="h-7 px-4 pt-1 flex items-center justify-between text-[11px] text-neutral-800 font-medium z-30 bg-[#f1f3f4] shrink-0">
                  <div className="flex items-center gap-1 pl-1">
                    <span className="font-semibold">{currentTime}</span>
                  </div>
                  <div className="flex items-center gap-2 pr-1">
                    <Wifi size={12} />
                    <span className="text-[10px] font-bold">5G</span>
                    <div className="flex items-center gap-1 text-[10px]">
                      <span>92%</span>
                      <Battery size={13} className="fill-neutral-800 stroke-neutral-800" />
                    </div>
                  </div>
                </div>

                {/* Chrome Mobile Address Bar */}
                <div className="h-11 bg-[#f1f3f4] border-b border-[#dadce0] px-2.5 flex items-center justify-between gap-2 shrink-0 z-30">
                  <div className="flex-1 h-8 bg-white rounded-full border border-[#dadce0] flex items-center px-3 gap-1.5 shadow-xs">
                    <Lock size={10} className="text-neutral-500 shrink-0" />
                    <span className="text-[11px] text-neutral-800 truncate flex-1 font-sans">
                      {protocol === 'html' ? (activeTab?.name || 'index.html') : urlInput.replace(/^https?:\/\//, '')}
                    </span>
                    <button 
                      onClick={handleRefresh}
                      className="text-neutral-500 hover:text-black p-0.5"
                      title="Reload Page"
                    >
                      <RotateCw size={11} className={isRefreshing ? 'animate-spin' : ''} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-700">
                    <div className="w-4 h-4 border border-neutral-700 rounded-xs flex items-center justify-center text-[9px] font-bold cursor-pointer">
                      1
                    </div>
                    <button onClick={handleOpenBrowser} className="hover:text-black cursor-pointer" title="Open in System Browser">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>

                {/* Main Viewport Content */}
                <div className="flex-1 w-full bg-white relative overflow-hidden flex flex-col">
                  {protocol === 'html' && activeTab ? (
                    <iframe
                      key={`pixel-html-${iframeKey}`}
                      srcDoc={getRenderedHtml() || '<!DOCTYPE html><html><body><div style="font-family:sans-serif;color:#888;padding:24px;text-align:center;">(Empty HTML Document)</div></body></html>'}
                      title="Pixel Chrome Viewport"
                      className="w-full h-full border-none bg-white"
                      sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
                    />
                  ) : (
                    <iframe
                      key={`pixel-server-${iframeKey}`}
                      src={urlInput}
                      title="Pixel Chrome Viewport"
                      className="w-full h-full border-none bg-white"
                      sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
                    />
                  )}
                </div>

                {/* Android 15 Gesture Navigation Bar */}
                <div className="h-5 bg-white flex items-center justify-center shrink-0">
                  <div className="w-24 h-[3.5px] bg-black/60 rounded-full" />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
