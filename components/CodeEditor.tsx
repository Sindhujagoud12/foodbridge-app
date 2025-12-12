import React, { useRef, useState, useEffect } from 'react';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  language?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const linesRef = useRef<HTMLDivElement>(null);
  const [lineCount, setLineCount] = useState(1);

  // Sync scroll between textarea and line numbers
  const handleScroll = () => {
    if (textareaRef.current && linesRef.current) {
      linesRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  useEffect(() => {
    const lines = code.split('\n').length;
    setLineCount(lines);
  }, [code]);

  return (
    <div className="relative w-full h-full flex bg-slate-900 overflow-hidden font-mono text-sm border border-slate-700 rounded-lg shadow-inner">
      {/* Line Numbers */}
      <div
        ref={linesRef}
        className="w-12 flex-shrink-0 bg-slate-900 border-r border-slate-800 text-slate-500 text-right pr-2 pt-4 select-none overflow-hidden"
        style={{ fontFamily: 'JetBrains Mono', lineHeight: '1.5rem' }}
      >
        {Array.from({ length: Math.max(lineCount, 1) }).map((_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>

      {/* Editor Area */}
      <textarea
        ref={textareaRef}
        value={code}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        className="flex-grow bg-transparent text-slate-200 p-4 outline-none resize-none whitespace-pre overflow-auto"
        style={{ fontFamily: 'JetBrains Mono', lineHeight: '1.5rem' }}
        spellCheck={false}
        placeholder="// Paste your code here..."
      />
    </div>
  );
};

export default CodeEditor;
