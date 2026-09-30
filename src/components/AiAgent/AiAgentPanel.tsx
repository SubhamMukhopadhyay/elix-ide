import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Plus, 
  Code2, 
  ShieldCheck, 
  X, 
  RotateCcw, 
  Check, 
  FileCode, 
  CheckCircle2, 
  Clock, 
  ChevronDown,
  ChevronRight,
  Info,
  Mic,
  MoreHorizontal,
  Bot,
  Terminal,
  Paperclip,
  Trash2,
  Maximize2,
  Minimize2,
  Globe,
  BookOpen,
  GitBranch,
  Bug,
  FileQuestion,
  RefreshCw,
  FileText
} from 'lucide-react';
import { AiMessage, AiPermissionLevel } from '../../types';

interface AiAgentPanelProps {
  onClose: () => void;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
  activeFilePath?: string;
  activeFileContent?: string;
  projectPath?: string;
}

export const AiAgentPanel: React.FC<AiAgentPanelProps> = ({
  onClose,
  isMaximized,
  onToggleMaximize,
  activeFilePath,
  activeFileContent,
  projectPath
}) => {
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [permissionLevel, setPermissionLevel] = useState<AiPermissionLevel>('full_agent');
  const [activeModel, setActiveModel] = useState<string>('Groq');
  const [activePopover, setActivePopover] = useState<'model' | 'history' | 'more' | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);

  const togglePopover = (popover: 'model' | 'history' | 'more', e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePopover(prev => (prev === popover ? null : popover));
  };

  // Audio Recording & Dictation Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const speechRecognitionRef = useRef<any>(null);

  // Past Sessions Storage
  const [sessions, setSessions] = useState<{ id: string; title: string; date: string }[]>([
    { id: 'sess_1', title: 'Component architecture refactor', date: 'Just now' }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modelButtonRef = useRef<HTMLButtonElement>(null);
  const modelMenuRef = useRef<HTMLDivElement>(null);
  const historyMenuRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  // @ Mention and / Action Menu state
  const [mentionMenuType, setMentionMenuType] = useState<'mention' | 'action' | null>(null);
  const [menuQuery, setMenuQuery] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const MENTION_OPTIONS = [
    {
      id: 'codebase',
      label: '@Codebase',
      description: 'Search & reference entire workspace codebase',
      icon: Globe,
      color: 'text-blue-400 bg-blue-500/10'
    },
    {
      id: 'files',
      label: activeFilePath ? `@${activeFilePath.split(/[/\\]/).pop()}` : '@CurrentFile',
      description: activeFilePath ? `Current open file (${activeFilePath.split(/[/\\]/).pop()})` : 'Attach active file to context',
      icon: FileCode,
      color: 'text-amber-400 bg-amber-500/10',
      action: () => {
        if (activeFilePath && !attachedFiles.includes(activeFilePath)) {
          setAttachedFiles(prev => [...prev, activeFilePath]);
        }
      }
    },
    {
      id: 'terminal',
      label: '@Terminal',
      description: 'Include recent terminal logs & errors',
      icon: Terminal,
      color: 'text-emerald-400 bg-emerald-500/10'
    },
    {
      id: 'git',
      label: '@GitDiff',
      description: 'Include unstaged & staged git changes',
      icon: GitBranch,
      color: 'text-purple-400 bg-purple-500/10'
    },
    {
      id: 'docs',
      label: '@Docs',
      description: 'Search framework & language documentation',
      icon: BookOpen,
      color: 'text-cyan-400 bg-cyan-500/10'
    }
  ];

  const ACTION_OPTIONS = [
    {
      id: 'explain',
      label: '/explain',
      description: 'Explain step-by-step how this code works',
      icon: FileQuestion,
      color: 'text-blue-400 bg-blue-500/10'
    },
    {
      id: 'fix',
      label: '/fix',
      description: 'Analyze bugs, compiler errors, and propose fixes',
      icon: Bug,
      color: 'text-red-400 bg-red-500/10'
    },
    {
      id: 'test',
      label: '/test',
      description: 'Generate comprehensive unit and integration tests',
      icon: CheckCircle2,
      color: 'text-emerald-400 bg-emerald-500/10'
    },
    {
      id: 'refactor',
      label: '/refactor',
      description: 'Clean up architecture and optimize performance',
      icon: RefreshCw,
      color: 'text-amber-400 bg-amber-500/10'
    },
    {
      id: 'doc',
      label: '/doc',
      description: 'Generate documentation and JSDoc/docstrings',
      icon: FileText,
      color: 'text-cyan-400 bg-cyan-500/10'
    },
    {
      id: 'terminal',
      label: '/terminal',
      description: 'Diagnose terminal output or suggest CLI command',
      icon: Terminal,
      color: 'text-emerald-400 bg-emerald-500/10'
    },
    {
      id: 'clear',
      label: '/clear',
      description: 'Clear conversation history and start fresh',
      icon: Trash2,
      color: 'text-zinc-400 bg-zinc-500/10',
      action: () => handleNewChat()
    }
  ];

  const getFilteredOptions = () => {
    if (mentionMenuType === 'mention') {
      return MENTION_OPTIONS.filter(o => 
        o.label.toLowerCase().includes(menuQuery) || 
        o.description.toLowerCase().includes(menuQuery)
      );
    }
    if (mentionMenuType === 'action') {
      return ACTION_OPTIONS.filter(o => 
        o.label.toLowerCase().includes(menuQuery) || 
        o.description.toLowerCase().includes(menuQuery)
      );
    }
    return [];
  };

  const selectMenuItem = (item: any) => {
    if (item.action) {
      item.action();
    }
    
    const cursorPos = textareaRef.current?.selectionStart || inputText.length;
    const textBeforeCursor = inputText.slice(0, cursorPos);
    const textAfterCursor = inputText.slice(cursorPos);

    if (mentionMenuType === 'mention') {
      const newBefore = textBeforeCursor.replace(/@[a-zA-Z0-9_-]*$/, `${item.label} `);
      setInputText(newBefore + textAfterCursor);
    } else if (mentionMenuType === 'action') {
      if (item.id === 'clear') {
        setInputText('');
      } else {
        const newBefore = textBeforeCursor.replace(/(?:^|\s)\/[a-zA-Z0-9_-]*$/, `${item.label} `);
        setInputText(newBefore + textAfterCursor);
      }
    }

    setMentionMenuType(null);
    setMenuQuery('');
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  };

  // Close popovers on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-popover-root]')) {
        setActivePopover(null);
      }
      if (menuContainerRef.current && !menuContainerRef.current.contains(target)) {
        setMentionMenuType(null);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Sync activeModel with saved AI configuration on mount
  useEffect(() => {
    if (window.elix?.getAiConfig) {
      window.elix.getAiConfig().then((cfg: any) => {
        if (cfg) {
          const key = (cfg.apiKey || '').trim();
          if (key.startsWith('gsk_') || cfg.provider === 'groq' || cfg.provider === 'grok') {
            setActiveModel('Groq');
          } else if (cfg.provider === 'openrouter' || key.startsWith('sk-or-')) {
            setActiveModel('OpenRouter');
          } else if (cfg.provider === 'nvidia' || key.startsWith('nvapi-')) {
            setActiveModel('NVIDIA');
          } else if (cfg.provider === 'gemini' || key.startsWith('AIza')) {
            setActiveModel('Gemini');
          }
        }
      }).catch(console.warn);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  // Attach active file automatically if available
  useEffect(() => {
    if (activeFilePath && !attachedFiles.includes(activeFilePath)) {
      setAttachedFiles([activeFilePath]);
    }
  }, [activeFilePath]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isProcessing) return;

    if (query === '/clear') {
      handleNewChat();
      return;
    }

    setInputText('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    const userMsg: AiMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: query
    };
    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);

    if (window.elix) {
      try {
        const response: AiMessage = await window.elix.processAiMessage({
          prompt: query,
          projectPath: projectPath || 'D:/Engineering/Project',
          currentFilePath: activeFilePath,
          currentFileContent: activeFileContent,
          permissionLevel,
          model: activeModel
        });
        setMessages(prev => [...prev, response]);
      } catch (err: any) {
        setMessages(prev => [
          ...prev,
          {
            id: `err_${Date.now()}`,
            sender: 'assistant',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            content: `Error communicating with AI Provider: ${err.message}`
          }
        ]);
      }
    }
    setIsProcessing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputText(val);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;

    const cursorPos = e.target.selectionStart || val.length;
    const textBeforeCursor = val.slice(0, cursorPos);
    
    // Check for @ mention at cursor
    const atMatch = textBeforeCursor.match(/@([a-zA-Z0-9_-]*)$/);
    // Check for / action at start of line or after whitespace
    const slashMatch = textBeforeCursor.match(/(?:^|\s)\/([a-zA-Z0-9_-]*)$/);

    if (atMatch) {
      setMentionMenuType('mention');
      setMenuQuery(atMatch[1].toLowerCase());
      setSelectedIndex(0);
    } else if (slashMatch) {
      setMentionMenuType('action');
      setMenuQuery(slashMatch[1].toLowerCase());
      setSelectedIndex(0);
    } else {
      setMentionMenuType(null);
      setMenuQuery('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionMenuType) {
      const filtered = getFilteredOptions();

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filtered.length || 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + (filtered.length || 1)) % (filtered.length || 1));
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          selectMenuItem(filtered[selectedIndex]);
        }
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setMentionMenuType(null);
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Dual-mode Voice Dictation (MediaRecorder + Web Speech API + Gemini/Groq Whisper)
  const toggleSpeechRecognition = async () => {
    if (isListening) {
      setIsListening(false);

      if (speechRecognitionRef.current) {
        try { speechRecognitionRef.current.stop(); } catch {}
      }

      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      return;
    }

    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size > 800 && window.elix?.transcribeAudio) {
          setIsTranscribing(true);
          try {
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
              const base64Audio = reader.result as string;
              const res = await window.elix.transcribeAudio(base64Audio, 'audio/webm');
              if (res.success && res.text) {
                setInputText(prev => prev ? `${prev} ${res.text}` : res.text);
              } else if (res.error) {
                console.warn(res.error);
              }
              setIsTranscribing(false);
            };
          } catch (err) {
            console.error('Transcription error:', err);
            setIsTranscribing(false);
          }
        }
      };

      mediaRecorder.start(200);
      setIsListening(true);

      // Attempt live webkitSpeechRecognition for real-time text stream
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';
          speechRecognitionRef.current = recognition;

          recognition.onresult = (event: any) => {
            const transcript = Array.from(event.results)
              .map((r: any) => r[0].transcript)
              .join('');
            if (transcript.trim()) {
              setInputText(transcript);
            }
          };

          recognition.onerror = () => {
            // Electron may block Google's speech service; mediaRecorder handles the audio fallback!
          };

          recognition.start();
        } catch {}
      }
    } catch (err: any) {
      console.error('Microphone error:', err);
      alert('Could not access microphone: ' + (err.message || 'Please check microphone permissions.'));
      setIsListening(false);
    }
  };

  const handleAcceptChange = async (msgId: string, filePath: string, newContent: string) => {
    if (window.elix) {
      await window.elix.applyAiFileChange(filePath, newContent);
      setMessages(prev =>
        prev.map(m => {
          if (m.id === msgId && m.proposedChanges) {
            return {
              ...m,
              proposedChanges: m.proposedChanges.map(c =>
                c.filePath === filePath ? { ...c, status: 'accepted' } : c
              )
            };
          }
          return m;
        })
      );
    }
  };

  const handleRejectChange = (msgId: string, filePath: string) => {
    setMessages(prev =>
      prev.map(m => {
        if (m.id === msgId && m.proposedChanges) {
          return {
            ...m,
            proposedChanges: m.proposedChanges.map(c =>
              c.filePath === filePath ? { ...c, status: 'rejected' } : c
            )
          };
        }
        return m;
      })
    );
  };

  const handleNewChat = () => {
    if (messages.length > 0) {
      const firstUserMsg = messages.find(m => m.sender === 'user')?.content.slice(0, 30) || 'Session';
      setSessions(prev => [{ id: `sess_${Date.now()}`, title: firstUserMsg, date: 'Just now' }, ...prev]);
    }
    setMessages([]);
    setInputText('');
  };

  // Clean Model List: Groq, Gemini, OpenRouter, NVIDIA
  const ELIX_MODELS = [
    'Groq',
    'Gemini',
    'OpenRouter',
    'NVIDIA'
  ];

  return (
    <div className="w-full h-full bg-[var(--ide-sidebar-bg)] border-l border-[var(--ide-border)] flex flex-col justify-between select-none z-20 text-[var(--ide-text)] font-sans text-xs">
      
      {/* ============================================================== */}
      {/* 1. TOP HEADER (Antigravity Style: Agent | + 🕒 ··· ✕) */}
      {/* ============================================================== */}
      <div className="h-10 px-4 flex items-center justify-between border-b border-[var(--ide-border)] bg-[var(--ide-title-bg)] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-[var(--ide-text)] tracking-tight">Agent</span>
        </div>

        <div className="flex items-center gap-1 text-[var(--ide-text-muted)]">
          {/* New Chat Button */}
          <button 
            onClick={handleNewChat}
            title="New Conversation (+)" 
            className="p-1.5 hover:bg-[var(--ide-hover-bg)] hover:text-[var(--ide-text)] rounded-md transition-colors"
          >
            <Plus size={14} />
          </button>

          {/* Sessions / History */}
          <div className="relative" data-popover-root="history">
            <button 
              onClick={(e) => togglePopover('history', e)}
              title="Conversation History" 
              className={`p-1.5 rounded-md transition-colors ${activePopover === 'history' ? 'bg-[var(--ide-hover-bg)] text-[var(--ide-text)]' : 'hover:bg-[var(--ide-hover-bg)] hover:text-[var(--ide-text)]'}`}
            >
              <Clock size={14} />
            </button>

            {activePopover === 'history' && (
              <div 
                ref={historyMenuRef}
                className="absolute right-0 top-full mt-1.5 z-50 w-64 bg-[var(--ide-panel-bg)] border border-[var(--ide-border)] rounded-xl shadow-2xl p-1.5 text-xs select-none text-[var(--ide-text)] animate-in fade-in zoom-in-95 duration-100"
              >
                <div className="px-3 py-1.5 text-[10px] text-[var(--ide-text-muted)] font-semibold uppercase tracking-wider border-b border-[var(--ide-border)] mb-1 flex items-center justify-between">
                  <span>Chat Sessions</span>
                  <button onClick={() => { handleNewChat(); setActivePopover(null); }} className="text-[#3b82f6] hover:underline normal-case font-normal">+ New</button>
                </div>
                {sessions.map(s => (
                  <div 
                    key={s.id}
                    onClick={() => setActivePopover(null)}
                    className="px-2.5 py-1.5 rounded-lg hover:bg-[var(--ide-hover-bg)] cursor-pointer flex items-center justify-between text-[var(--ide-text)]"
                  >
                    <span className="truncate max-w-[160px] text-[11px]">{s.title}</span>
                    <span className="text-[9px] text-[var(--ide-text-muted)]">{s.date}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* More Options */}
          <div className="relative" data-popover-root="more">
            <button 
              onClick={(e) => togglePopover('more', e)}
              title="More Actions" 
              className={`p-1.5 rounded-md transition-colors ${activePopover === 'more' ? 'bg-[var(--ide-hover-bg)] text-[var(--ide-text)]' : 'hover:bg-[var(--ide-hover-bg)] hover:text-[var(--ide-text)]'}`}
            >
              <MoreHorizontal size={14} />
            </button>

            {activePopover === 'more' && (
              <div 
                ref={moreMenuRef}
                className="absolute right-0 top-full mt-1.5 z-50 w-52 bg-[var(--ide-panel-bg)] border border-[var(--ide-border)] rounded-xl shadow-2xl p-1 text-xs select-none text-[var(--ide-text)] animate-in fade-in zoom-in-95 duration-100"
              >
                <div className="px-3 py-1 text-[10px] text-[var(--ide-text-muted)] font-semibold uppercase tracking-wider">
                  Permission Level
                </div>
                {[
                  { id: 'full_agent', label: 'Default Approvals (Full)' },
                  { id: 'edit_files', label: 'Edit Files Only' },
                  { id: 'read_only', label: 'Read Only (Safe)' }
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => { setPermissionLevel(p.id as any); setActivePopover(null); }}
                    className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-[var(--ide-hover-bg)] flex items-center justify-between text-[var(--ide-text)]"
                  >
                    <span>{p.label}</span>
                    {permissionLevel === p.id && <Check size={12} className="text-[#3b82f6]" />}
                  </button>
                ))}
                <div className="border-t border-[var(--ide-border)] my-1" />
                <button
                  onClick={() => {
                    handleNewChat();
                    setActivePopover(null);
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-500 flex items-center gap-1.5"
                >
                  <Trash2 size={12} />
                  <span>Clear Current Chat</span>
                </button>
              </div>
            )}
          </div>

          {/* Maximize / Restore Agent Panel */}
          {onToggleMaximize && (
            <button 
              onClick={onToggleMaximize} 
              title={isMaximized ? "Restore Panel Size" : "Maximize Panel"} 
              className="p-1.5 hover:bg-[var(--ide-hover-bg)] hover:text-[var(--ide-text)] rounded-md transition-colors"
            >
              {isMaximized ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>
          )}

          {/* Close Agent Panel */}
          <button 
            onClick={onClose} 
            title="Close Panel" 
            className="p-1.5 hover:bg-[var(--ide-hover-bg)] hover:text-[var(--ide-text)] rounded-md transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. CHAT CANVAS: Empty State or Conversation Stream */}
      {/* ============================================================== */}
      <div className="flex-1 overflow-y-auto p-4 select-text">
        {messages.length === 0 ? (
          /* Simple Minimalist Empty Canvas */
          <div className="h-full flex flex-col items-center justify-center p-4 text-center select-none">
            <h2 className="text-xl font-bold text-[var(--ide-text)] tracking-tight">
              Elix Agent
            </h2>
          </div>
        ) : (
          /* Active Messages Stream */
          <div className="space-y-4">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 text-[10px] text-[var(--ide-text-muted)]">
                  <span className="font-medium text-[var(--ide-text)]">{msg.sender === 'user' ? 'You' : 'Agent'}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div
                  className={`p-3.5 rounded-2xl max-w-[92%] leading-relaxed text-[12px] ${
                    msg.sender === 'user'
                      ? 'bg-[var(--ide-hover-bg)] text-[var(--ide-text)] border border-[var(--ide-border)] shadow-sm'
                      : 'bg-[var(--ide-input-bg)] border border-[var(--ide-border)] text-[var(--ide-text)] shadow-sm'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                  {/* Execution Plan Steps */}
                  {msg.isPlan && msg.planSteps && (
                    <div className="mt-3 pt-3 border-t border-[var(--ide-border)] space-y-1.5">
                      <span className="font-medium text-[var(--ide-accent)] block text-[11px]">Execution Steps:</span>
                      {msg.planSteps.map(step => (
                        <div key={step.id} className="flex items-center gap-2 text-[11px] text-[var(--ide-text-muted)]">
                          {step.status === 'completed' ? (
                            <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                          ) : (
                            <Clock size={13} className="text-amber-500 shrink-0" />
                          )}
                          <span className="text-[var(--ide-text)]">{step.title}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Proposed File Changes Diff Review */}
                  {msg.proposedChanges && msg.proposedChanges.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[var(--ide-border)] space-y-2">
                      <span className="font-medium text-amber-500 block text-[11px]">
                        Proposed Changes:
                      </span>
                      {msg.proposedChanges.map((change, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 bg-[var(--ide-sidebar-bg)] rounded-xl border border-[var(--ide-border)] text-[11px]"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-mono text-[var(--ide-accent)] truncate max-w-[180px]">
                              {change.filePath.split(/[/\\]/).pop()}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                change.status === 'accepted'
                                  ? 'bg-emerald-500/10 text-emerald-500'
                                  : change.status === 'rejected'
                                  ? 'bg-red-500/10 text-red-500'
                                  : 'bg-amber-500/10 text-amber-500'
                              }`}
                            >
                              {change.status}
                            </span>
                          </div>

                          {change.status === 'pending' && (
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => handleAcceptChange(msg.id, change.filePath, change.newContent)}
                                className="flex-1 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-medium transition-colors"
                              >
                                Accept & Apply
                              </button>
                              <button
                                onClick={() => handleRejectChange(msg.id, change.filePath)}
                                className="px-3 py-1 bg-[var(--ide-hover-bg)] text-[var(--ide-text)] rounded-lg text-[10px] font-medium transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 3. INPUT CARD CONTAINER (Antigravity Style: media_1790539892893.png) */}
      {/* ============================================================== */}
      <div className="p-3 bg-[var(--ide-sidebar-bg)] shrink-0">
        
        {/* Antigravity Input Box Card */}
        <div className="relative bg-[var(--ide-input-bg)] border border-[var(--ide-border)] focus-within:border-[var(--ide-accent)] rounded-2xl p-3 shadow-sm transition-all">
          
          {/* Autocomplete Menu for @ Mentions and / Actions */}
          {mentionMenuType && (
            <div 
              ref={menuContainerRef}
              className="absolute bottom-full left-0 right-0 mb-2 bg-[var(--ide-panel-bg)] border border-[var(--ide-border)] rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-100"
            >
              <div className="px-3.5 py-2 bg-[var(--ide-sidebar-bg)] border-b border-[var(--ide-border)] flex items-center justify-between text-[11px] font-medium text-[var(--ide-text-muted)]">
                <span className="flex items-center gap-1.5 font-semibold text-[var(--ide-text)]">
                  {mentionMenuType === 'mention' ? (
                    <>
                      <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-mono text-[11px] font-bold">@</span>
                      <span>Mention Context</span>
                    </>
                  ) : (
                    <>
                      <span className="w-4 h-4 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-mono text-[11px] font-bold">/</span>
                      <span>Quick Actions & Commands</span>
                    </>
                  )}
                </span>
                <span className="text-[10px] text-[var(--ide-text-muted)] flex items-center gap-1">
                  <span className="px-1 py-0.5 bg-[var(--ide-hover-bg)] rounded border border-[var(--ide-border)] text-[9px] font-mono">↑↓</span>
                  <span>navigate</span>
                  <span className="px-1 py-0.5 bg-[var(--ide-hover-bg)] rounded border border-[var(--ide-border)] text-[9px] font-mono ml-1">↵</span>
                  <span>select</span>
                </span>
              </div>

              <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
                {getFilteredOptions().length > 0 ? (
                  getFilteredOptions().map((opt, idx) => {
                    const Icon = opt.icon;
                    const isSelected = idx === selectedIndex;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          selectMenuItem(opt);
                        }}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition-colors cursor-pointer ${
                          isSelected 
                            ? 'bg-[var(--ide-hover-bg)] border border-[var(--ide-accent)]/50 shadow-sm' 
                            : 'hover:bg-[var(--ide-hover-bg)] border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${opt.color || 'bg-[var(--ide-hover-bg)] text-[var(--ide-text)]'}`}>
                            <Icon size={13} />
                          </div>
                          <div className="min-w-0">
                            <div className="font-mono text-xs font-semibold text-[var(--ide-text)] flex items-center gap-1.5">
                              <span>{opt.label}</span>
                            </div>
                            <div className="text-[10px] text-[var(--ide-text-muted)] truncate max-w-[280px]">
                              {opt.description}
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <span className="text-[10px] text-[var(--ide-text-muted)] font-mono shrink-0 px-1.5 py-0.5 rounded bg-[var(--ide-panel-bg)] border border-[var(--ide-border)]">
                            Tab ↵
                          </span>
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className="px-3 py-3 text-center text-xs text-[var(--ide-text-muted)]">
                    No matching {mentionMenuType === 'mention' ? 'mentions' : 'actions'} found for "{menuQuery}"
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Active File / Context pill if attached */}
          {attachedFiles.length > 0 && (
            <div className="flex items-center gap-1.5 mb-2 flex-wrap">
              {attachedFiles.map(f => (
                <span key={f} className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[var(--ide-hover-bg)] text-[11px] text-[var(--ide-text)] border border-[var(--ide-border)]">
                  <FileCode size={11} className="text-[var(--ide-accent)]" />
                  <span className="truncate max-w-[150px]">{f.split(/[/\\]/).pop()}</span>
                  <button onClick={() => setAttachedFiles(prev => prev.filter(x => x !== f))} className="hover:opacity-75">
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Text Input with Antigravity Placeholder */}
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything, @ to mention, / for actions"
            className="w-full bg-transparent resize-none outline-none text-[var(--ide-text)] placeholder-[var(--ide-text-muted)] text-[13px] leading-relaxed min-h-[46px] max-h-[160px]"
          />

          {/* Bottom Controls Bar Inside Card */}
          <div className="flex items-center justify-between pt-1 mt-1 border-t border-[var(--ide-border)]">
            
            {/* Left side: + (Attach) and Model Selector Pill */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  if (activeFilePath && !attachedFiles.includes(activeFilePath)) {
                    setAttachedFiles(prev => [...prev, activeFilePath]);
                  } else {
                    setMentionMenuType(prev => prev === 'mention' ? null : 'mention');
                  }
                }}
                title="Add context or file (@)"
                className="w-6 h-6 rounded-md hover:bg-[var(--ide-hover-bg)] text-[var(--ide-text-muted)] hover:text-[var(--ide-text)] flex items-center justify-center transition-colors"
              >
                <Plus size={14} />
              </button>

              {/* Elix Model Picker Pill & Dropdown */}
              <div className="relative" data-popover-root="model">
                <button
                  ref={modelButtonRef}
                  type="button"
                  onClick={(e) => togglePopover('model', e)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--ide-hover-bg)] hover:opacity-90 text-[var(--ide-text)] text-xs font-medium border border-[var(--ide-border)] transition-colors"
                >
                  <span className="truncate max-w-[140px] text-[11px]">{activeModel}</span>
                  <ChevronDown size={11} className="text-[var(--ide-text-muted)] shrink-0" />
                </button>

                {/* Clean Model Popover positioned on left side with Toggle */}
                {activePopover === 'model' && (
                  <div
                    ref={modelMenuRef}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-full left-0 mb-2 w-52 bg-[var(--ide-panel-bg)] border border-[var(--ide-border)] rounded-2xl shadow-2xl p-1.5 z-50 text-xs font-sans select-none animate-in fade-in zoom-in-95 duration-100 text-[var(--ide-text)]"
                  >
                    {/* Header */}
                    <div className="text-[var(--ide-text-muted)] text-xs font-medium px-3 py-1.5">
                      Model
                    </div>

                    {/* Model Items - Clean Single-Line */}
                    <div className="space-y-0.5">
                      {ELIX_MODELS.map(m => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => {
                            setActiveModel(m);
                            setActivePopover(null);
                          }}
                          className={`w-full px-3 py-1.5 rounded-xl flex items-center justify-between text-left transition-colors ${
                            activeModel === m 
                              ? 'bg-[var(--ide-hover-bg)] text-[var(--ide-text)] font-semibold' 
                              : 'text-[var(--ide-text)] hover:bg-[var(--ide-hover-bg)]'
                          }`}
                        >
                          <span className="text-[12px]">{m}</span>
                          {activeModel === m && <Check size={12} className="text-[var(--ide-accent)]" />}
                        </button>
                      ))}
                    </div>

                    {/* Bottom Disclaimer & Settings Link */}
                    <div className="border-t border-[var(--ide-border)] mt-1.5 pt-2 px-3 pb-1 text-[11px] text-[var(--ide-text-muted)] leading-relaxed">
                      <p>
                        Zero rate-limit failover across providers.
                      </p>
                      <button 
                        type="button"
                        onClick={() => {
                          setActivePopover(null);
                          window.dispatchEvent(new CustomEvent('open-settings', { detail: { category: 'ai' } }));
                        }}
                        className="text-[#3b82f6] hover:underline cursor-pointer inline-block mt-0.5 text-left text-[11px]"
                      >
                        Configure API keys
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right side: Mic & Send Arrow */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                disabled={isTranscribing}
                title={
                  isTranscribing 
                    ? "Transcribing audio..." 
                    : isListening 
                    ? "Listening... Click to stop & transcribe" 
                    : "Voice dictation"
                }
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                  isTranscribing
                    ? "bg-amber-500/20 text-amber-500 animate-pulse border border-amber-500/40"
                    : isListening 
                    ? "bg-red-500/20 text-red-500 animate-pulse border border-red-500/40" 
                    : "hover:bg-[var(--ide-hover-bg)] text-[var(--ide-text-muted)] hover:text-[var(--ide-text)]"
                }`}
              >
                <Mic size={14} className={isListening ? "text-red-500" : ""} />
              </button>

              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={isProcessing || !inputText.trim()}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                  inputText.trim() && !isProcessing
                    ? "bg-[var(--ide-accent)] text-white hover:opacity-90 active:scale-95 shadow-sm"
                    : "bg-[var(--ide-hover-bg)] text-[var(--ide-text-muted)] opacity-50 cursor-not-allowed"
                }`}
              >
                <ArrowRight size={13} className="stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>

        {/* Elix Agent Bottom Disclaimer */}
        <div className="text-[11px] text-[var(--ide-text-muted)] text-center mt-2.5 leading-tight">
          AI may make mistakes. Double-check all generated code.
        </div>
      </div>
    </div>
  );
};
