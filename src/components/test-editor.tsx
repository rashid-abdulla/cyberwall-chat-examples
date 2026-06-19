import React, { useState } from "react";
import type { TestCase, TestCaseType, Language, InputType } from "../models/test-case";
import { Plus, Trash2, Settings } from "lucide-react";

interface TestEditorProps {
  testCase: TestCase;
  onChange: (updatedTestCase: TestCase) => void;
}

const CATEGORIES = [
  "Phone Number Analysis",
  "Email Address Analysis",
  "UPI ID Analysis",
  "Bank Account Analysis",
  "URL and Domain Analysis",
  "SMS Message & Sender ID Analysis",
  "APK File Analysis",
  "Scam Content Analysis",
  "Image Analysis (Cyber-fraud indicators)",
  "Multi-Entity Analysis",
];

export const TestEditor: React.FC<TestEditorProps> = ({ testCase, onChange }) => {
  const [newBehavior, setNewBehavior] = useState("");

  const updateField = (key: keyof TestCase, value: any) => {
    onChange({
      ...testCase,
      [key]: value,
    });
  };

  const handleAddBehavior = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBehavior.trim()) return;
    updateField("expectedBehavior", [...testCase.expectedBehavior, newBehavior.trim()]);
    setNewBehavior("");
  };

  const handleRemoveBehavior = (index: number) => {
    const updated = testCase.expectedBehavior.filter((_, i) => i !== index);
    updateField("expectedBehavior", updated);
  };

  const handleEditBehavior = (index: number, val: string) => {
    const updated = [...testCase.expectedBehavior];
    updated[index] = val;
    updateField("expectedBehavior", updated);
  };

  return (
    <div className="test-editor">
      <div className="test-editor-header">
        <Settings size={18} />
        <h3>Test Case Settings</h3>
      </div>

      <div className="editor-form-grid">
        {/* Test ID & Category */}
        <div className="form-group">
          <label htmlFor="edit-id">Test Case ID</label>
          <input
            id="edit-id"
            type="text"
            value={testCase.id}
            onChange={(e) => updateField("id", e.target.value)}
            className="form-control font-mono"
            placeholder="e.g. CORE-001"
          />
        </div>

        <div className="form-group">
          <label htmlFor="edit-category">Category</label>
          <select
            id="edit-category"
            value={testCase.category}
            onChange={(e) => updateField("category", e.target.value)}
            className="form-control"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
            {!CATEGORIES.includes(testCase.category) && (
              <option value={testCase.category}>{testCase.category}</option>
            )}
          </select>
        </div>

        {/* Language, Input Type, Test Case Type */}
        <div className="form-group">
          <label htmlFor="edit-language">Language</label>
          <select
            id="edit-language"
            value={testCase.language}
            onChange={(e) => updateField("language", e.target.value as Language)}
            className="form-control"
          >
            <option value="en">English (en)</option>
            <option value="ml">Malayalam (ml)</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="edit-input-type">Input Type</label>
          <select
            id="edit-input-type"
            value={testCase.inputType}
            onChange={(e) => updateField("inputType", e.target.value as InputType)}
            className="form-control"
          >
            <option value="text">Text</option>
            <option value="voice">Voice Transcript</option>
            <option value="image">Image Description</option>
            <option value="mixed">Mixed Input</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="edit-test-type">Test Category Type</label>
          <select
            id="edit-test-type"
            value={testCase.type}
            onChange={(e) => updateField("type", e.target.value as TestCaseType)}
            className="form-control"
          >
            <option value="happy">Happy Path</option>
            <option value="edge">Edge Case</option>
            <option value="failure">Failure Case (Loss/1930)</option>
            <option value="abuse">Abuse/Phishing Refusal</option>
          </select>
        </div>
      </div>

      {/* Objective */}
      <div className="form-group mt-3">
        <label htmlFor="edit-objective">Test Objective</label>
        <input
          id="edit-objective"
          type="text"
          value={testCase.objective}
          onChange={(e) => updateField("objective", e.target.value)}
          className="form-control"
          placeholder="What does this test validate?"
        />
      </div>

      {/* Scenario */}
      <div className="form-group mt-3">
        <label htmlFor="edit-scenario">Scenario Description</label>
        <textarea
          id="edit-scenario"
          value={testCase.scenario}
          onChange={(e) => updateField("scenario", e.target.value)}
          className="form-control"
          rows={2}
          placeholder="Describe the citizen interaction context..."
        />
      </div>

      {/* Expected Behavior Bullet List */}
      <div className="expected-behaviors-editor mt-4">
        <h4>Expected Behavior Checklist</h4>
        <div className="behavior-items">
          {testCase.expectedBehavior.length === 0 ? (
            <p className="no-behavior-text">No expectations specified. Add some outcomes below.</p>
          ) : (
            testCase.expectedBehavior.map((item, index) => (
              <div key={index} className="behavior-item">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleEditBehavior(index, e.target.value)}
                  className="behavior-input"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveBehavior(index)}
                  className="delete-behavior-btn"
                  title="Remove Expectation"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleAddBehavior} className="add-behavior-form mt-2">
          <input
            type="text"
            value={newBehavior}
            onChange={(e) => setNewBehavior(e.target.value)}
            placeholder="Add new expected outcome (e.g. 'Escalate to 1930')"
            className="form-control"
          />
          <button type="submit" className="btn-add-behavior">
            <Plus size={16} /> Add
          </button>
        </form>
      </div>
    </div>
  );
};
