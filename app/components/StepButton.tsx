"use client";

import { useState } from "react";

interface StepButtonProps {
  label: string;
  disabled: boolean;
  onExecute: () => Promise<{ summary: string; details?: any }>;
  onComplete: () => void;
}

export function StepButton({
  label,
  disabled,
  onExecute,
  onComplete,
}: StepButtonProps) {
  const [completed, setCompleted] = useState(false);
  const [output, setOutput] = useState<{
    summary: string;
    details?: any;
  } | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  const handleClick = async () => {
    try {
      const result = await onExecute();
      setOutput(result);
      setCompleted(true);
      onComplete();
    } catch (error) {
      setOutput({
        summary: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }
  };

  if (!completed) {
    return (
      <button
        onClick={handleClick}
        disabled={disabled}
        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors disabled:bg-gray-900 disabled:cursor-not-allowed"
      >
        {label}
      </button>
    );
  }

  return (
    <div className="bg-gray-700 text-gray-200 rounded overflow-hidden">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full p-4 text-left hover:bg-gray-600 transition-colors flex justify-between items-center"
      >
        <span className={output?.details ? "font-semibold" : "text-sm"}>
          {output?.summary}
        </span>
        <span className="text-sm">{collapsed ? "▼" : "▲"}</span>
      </button>
      {!collapsed && output?.details && (
        <div className="px-4 pb-4">
          <pre className="text-xs overflow-auto bg-gray-800 p-2 rounded">
            {typeof output.details === "string"
              ? output.details
              : JSON.stringify(output.details, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

