import React, { useEffect, useState } from "react";
import { ClipboardIcon, CheckIcon, PencilIcon } from '@heroicons/react/24/outline';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface TransformationBoxProps {
    samples?: string[];
    targetValues?: string[];
    code: string;
    setCode: (code: string) => void;
    onTransformationTypeChange?: (type: string) => void;
}

const TransformationBox: React.FC<TransformationBoxProps> = ({
    samples = [],
    targetValues = [],
    code,
    setCode,
    onTransformationTypeChange,
}) => {
    const [copied, setCopied] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editableCode, setEditableCode] = useState(code);
    const [functionType, setFunctionType] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!samples.length || !targetValues.length) return;

        const fetchFunction = async () => {
            try {
                setLoading(true);
                const response = await fetch("http://localhost:5000/generate-function", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ source_values: samples, target_values: targetValues }),
                });

                const data = await response.json();
                setCode(data.pythonFunction || "Failed to generate function");
                const transformationType = data.type || null;
                setFunctionType(transformationType);
                if (onTransformationTypeChange && transformationType) {
                    onTransformationTypeChange(transformationType);
                }
            } catch (error) {
                console.error("Error fetching function:", error);
                setCode("Error fetching function");
            } finally {
                setLoading(false);
            }
        };

        fetchFunction();
    }, [samples, targetValues, setCode, onTransformationTypeChange]);

    const handleCopy = async () => {
        if (!code) return;
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleEditToggle = () => {
        if (isEditing) {
            setCode(editableCode);
        } else {
            setEditableCode(code);
        }
        setIsEditing(!isEditing);
    };

    const handleEditableCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEditableCode(e.target.value);
    };

    return (
        <div className="bg-[#1e1e1e] text-white rounded-xl p-6 shadow-2xl mt-6 space-y-4 font-mono">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-teal-400">🧠 Python Transformation Editor</h3>
                <div className="flex gap-2">
                    <button
                        onClick={handleEditToggle}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                    >
                        <PencilIcon className="w-4 h-4" />
                        {isEditing ? "Save" : "Edit"}
                    </button>
                    <button
                        onClick={handleCopy}
                        className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                    >
                        {copied ? (
                            <>
                                <CheckIcon className="w-4 h-4 text-green-400" />
                                Copied
                            </>
                        ) : (
                            <>
                                <ClipboardIcon className="w-4 h-4" />
                                Copy
                            </>
                        )}
                    </button>
                </div>
            </div>

            {functionType && (
                <p className="text-sm text-purple-300">
                    Function Type: <span className="bg-purple-800 px-2 py-1 rounded">{functionType}</span>
                </p>
            )}

            {isEditing ? (
                <textarea
                    value={editableCode}
                    onChange={handleEditableCodeChange}
                    rows={12}
                    className="w-full bg-[#2d2d2d] text-white p-4 rounded-lg resize-y border border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    spellCheck={false}
                />
            ) : (
                <div className="border border-gray-700 rounded-lg overflow-hidden">
                    {loading ? (
                        <div className="p-4 text-blue-400 animate-pulse">⏳ Generating code...</div>
                    ) : (
                        <SyntaxHighlighter language="python" style={vscDarkPlus} wrapLongLines showLineNumbers>
                            {code || "# No code generated yet."}
                        </SyntaxHighlighter>
                    )}
                </div>
            )}
        </div>
    );
};

export default TransformationBox;
