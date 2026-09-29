import React, { useMemo } from 'react';
import { marked } from 'marked';
import { BookOpen, ExternalLink } from 'lucide-react';

interface MarkdownViewerProps {
  content: string;
  fileName?: string;
  filePath?: string;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({
  content,
  fileName,
  filePath
}) => {
  const renderedHtml = useMemo(() => {
    try {
      return marked.parse(content || '') as string;
    } catch (e) {
      return '<p class="text-red-400">Failed to render markdown</p>';
    }
  }, [content]);

  return (
    <div className="flex-1 h-full w-full bg-[var(--ide-bg)] flex flex-col overflow-hidden select-text">
      {/* Markdown Content Canvas */}
      <div className="flex-1 overflow-auto p-8 max-w-4xl mx-auto w-full">
        <div 
          className="prose prose-invert max-w-none text-[14px] leading-relaxed
                     [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:border-b [&_h1]:border-[var(--ide-border)] [&_h1]:pb-2 [&_h1]:mb-4 [&_h1]:text-[var(--ide-text)]
                     [&_h2]:text-xl [&_h2]:font-bold [&_h2]:border-b [&_h2]:border-[var(--ide-border)] [&_h2]:pb-1.5 [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-[var(--ide-text)]
                     [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-[var(--ide-text)]
                     [&_p]:mb-4 [&_p]:text-[var(--ide-text)]
                     [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:text-[var(--ide-text)]
                     [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_ol]:text-[var(--ide-text)]
                     [&_li]:mb-1
                     [&_pre]:bg-[var(--ide-sidebar-bg)] [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-[var(--ide-border)] [&_pre]:overflow-x-auto [&_pre]:mb-4
                     [&_code]:font-mono [&_code]:text-xs [&_code]:text-cyan-400 [&_code]:bg-[var(--ide-input-bg)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded
                     [&_blockquote]:border-l-4 [&_blockquote]:border-[#007acc] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-[var(--ide-text-muted)] [&_blockquote]:my-4
                     [&_table]:w-full [&_table]:border-collapse [&_table]:my-4
                     [&_td]:border [&_td]:border-[var(--ide-border)] [&_td]:p-2.5 [&_td]:text-xs
                     [&_th]:border [&_th]:border-[var(--ide-border)] [&_th]:p-2.5 [&_th]:bg-[var(--ide-sidebar-bg)] [&_th]:text-xs [&_th]:font-semibold
                     [&_hr]:border-[var(--ide-border)] [&_hr]:my-6
                     [&_a]:text-[#007acc] [&_a]:underline hover:[&_a]:text-[#1188dd]"
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
      </div>
    </div>
  );
};
