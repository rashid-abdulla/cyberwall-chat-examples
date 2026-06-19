import React, { useState, useEffect } from "react";
import type { TestCase } from "../models/test-case";
import { Copy, Check, AlertCircle, Terminal } from "lucide-react";

interface JSONViewerProps {
  testCase: TestCase;
  onChange: (updatedTestCase: TestCase) => void;
}

export const JSONViewer: React.FC<JSONViewerProps> = ({ testCase, onChange }) => {
  const [jsonText, setJsonText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Sync state with incoming testCase prop when it changes externally
  useEffect(() => {
    setJsonText(JSON.stringify(testCase, null, 2));
    setError(null);
  }, [testCase]);

  const handleTextChange = (val: string) => {
    setJsonText(val);
    try {
      const parsed = JSON.parse(val);
      
      // Basic schema validation
      const requiredFields: Array<keyof TestCase> = [
        "id",
        "category",
        "objective",
        "scenario",
        "language",
        "inputType",
        "type",
        "chat",
        "expectedBehavior",
      ];
      
      for (const field of requiredFields) {
        if (parsed[field] === undefined) {
          setError(`Validation Error: Missing required field "${field}"`);
          return;
        }
      }

      if (!Array.isArray(parsed.chat)) {
        setError(`Validation Error: "chat" must be an array of messages`);
        return;
      }

      if (!Array.isArray(parsed.expectedBehavior)) {
        setError(`Validation Error: "expectedBehavior" must be an array of strings`);
        return;
      }

      // Valid case: clear error and notify parent
      setError(null);
      onChange(parsed as TestCase);
    } catch (e: any) {
      setError(`JSON Parse Error: ${e.message}`);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="json-viewer">
      <div className="json-header">
        <div className="json-title-group">
          <Terminal size={16} />
          <h3>JSON Inspector</h3>
        </div>
        <button type="button" onClick={handleCopy} className="copy-btn btn-secondary">
          {copied ? (
            <>
              <Check size={14} className="success-color" /> Copied!
            </>
          ) : (
            <>
              <Copy size={14} /> Copy JSON
            </>
          )}
        </button>
      </div>

      <div className="json-editor-container">
        <textarea
          value={jsonText}
          onChange={(e) => handleTextChange(e.target.value)}
          className={`json-textarea ${error ? "json-error-border" : "json-success-border"}`}
          spellCheck={false}
        />
      </div>

      {/* Validation status bar */}
      <div className={`validation-status-bar ${error ? "status-invalid" : "status-valid"}`}>
        {error ? (
          <>
            <AlertCircle size={14} />
            <span className="status-text">{error}</span>
          </>
        ) : (
          <>
            <Check size={14} />
            <span className="status-text">Valid TestCase JSON Schema</span>
          </>
        )}
      </div>
    </div>
  );
};
