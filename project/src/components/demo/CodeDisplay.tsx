import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeDisplayProps {
  code: string;
}

const CodeDisplay: React.FC<CodeDisplayProps> = ({ code }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="relative">
      <div className="bg-slate-900 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-slate-800">
          <span className="text-slate-300 text-sm font-medium">Transformation Code</span>
          <button 
            onClick={handleCopy}
            className="p-1 rounded hover:bg-slate-700 text-slate-300 transition-colors"
            aria-label="Copy code"
          >
            {copied ? (
              <Check size={18} className="text-green-400" />
            ) : (
              <Copy size={18} />
            )}
          </button>
        </div>
        <pre className="p-4 text-sm overflow-x-auto text-slate-300">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

export default CodeDisplay;