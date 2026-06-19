import React, { useState } from "react";
import type { ChatMessage, TestCase } from "../models/test-case";
import { Trash2, ArrowUp, ArrowDown, Plus, User, Shield, Check, X, Edit2 } from "lucide-react";

interface ChatEditorProps {
  testCase: TestCase;
  onChange: (updatedChat: ChatMessage[]) => void;
  onDelete: () => void;
}

export const ChatEditor: React.FC<ChatEditorProps> = ({
  testCase,
  onChange,
  onDelete,
}) => {
  const chat = testCase.chat;
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  const handleStartEdit = (index: number, content: string) => {
    setEditingIndex(index);
    setEditText(content);
  };

  const handleSaveEdit = (index: number) => {
    const updated = [...chat];
    updated[index] = { ...updated[index], content: editText };
    onChange(updated);
    setEditingIndex(null);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
  };

  const handleDelete = (index: number) => {
    const updated = chat.filter((_, i) => i !== index);
    onChange(updated);
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= chat.length) return;

    const updated = [...chat];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChange(updated);

    if (editingIndex === index) {
      setEditingIndex(targetIndex);
    } else if (editingIndex === targetIndex) {
      setEditingIndex(index);
    }
  };

  const handleAddMessage = (role: "user" | "assistant") => {
    const newMessage: ChatMessage = {
      role,
      content: role === "user" ? "Enter user message..." : "Trust Score: 50/100\n\nReasoning: ...",
    };
    onChange([...chat, newMessage]);
    // Automatically focus editing on the new message
    setEditingIndex(chat.length);
    setEditText(newMessage.content);
  };

  const toggleRole = (index: number) => {
    const updated = [...chat];
    updated[index] = {
      ...updated[index],
      role: updated[index].role === "user" ? "assistant" : "user",
    };
    onChange(updated);
  };

  return (
    <div className="chat-editor" id={`tc-card-${testCase.id}`}>
      <div className="chat-editor-header" style={{ display: "flex", flexDirection: "column", gap: "12px", borderBottom: "1px solid #dcdfd9", paddingBottom: "16px", marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%", gap: "16px" }}>
          <div>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="font-mono" style={{ color: "var(--color-ink)", opacity: 0.7 }}>{testCase.id}</span>
              <span>{testCase.objective}</span>
            </h3>
            <p style={{ fontSize: "12px", color: "var(--color-body)", marginTop: "4px" }}>Category: {testCase.category}</p>
          </div>
          
          <button
            type="button"
            onClick={onDelete}
            className="btn-secondary delete-btn"
            style={{ fontSize: "12px", padding: "6px 12px", height: "30px", color: "var(--color-negative)", flexShrink: 0 }}
            title="Delete this test case"
          >
            <Trash2 size={13} /> Delete Chat
          </button>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", width: "100%" }}>
          <span className="badge">{chat.length} messages</span>
        </div>
      </div>

      <div className="chat-bubbles-container">
        {chat.length === 0 ? (
          <div className="empty-chat-state">
            <p>No messages in this conversation. Add one below!</p>
          </div>
        ) : (
          chat.map((msg, index) => {
            const isUser = msg.role === "user";
            const isEditing = editingIndex === index;

            return (
              <div
                key={index}
                className={`chat-bubble-wrapper ${isUser ? "user-wrapper" : "assistant-wrapper"}`}
              >
                {/* Avatar Icon */}
                <div className={`avatar ${isUser ? "user-avatar" : "assistant-avatar"}`} onClick={() => toggleRole(index)} title="Click to toggle role">
                  {isUser ? <User size={16} /> : <Shield size={16} />}
                </div>

                {/* Bubble Body */}
                <div className={`chat-bubble ${isUser ? "user-bubble" : "assistant-bubble"}`}>
                  <div className="bubble-metadata">
                    <span className="role-tag">{isUser ? "Citizen" : "Cyberwall"}</span>
                    
                    {/* Actions Panel */}
                    <div className="bubble-actions">
                      <button
                        type="button"
                        onClick={() => handleMove(index, "up")}
                        disabled={index === 0}
                        title="Move Up"
                        className="action-btn"
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(index, "down")}
                        disabled={index === chat.length - 1}
                        title="Move Down"
                        className="action-btn"
                      >
                        <ArrowDown size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStartEdit(index, msg.content)}
                        title="Edit Message"
                        className="action-btn edit-btn"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(index)}
                        title="Delete Message"
                        className="action-btn delete-btn"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  {isEditing ? (
                    <div className="bubble-edit-mode">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="bubble-textarea"
                        rows={Math.max(2, editText.split("\n").length)}
                        autoFocus
                      />
                      <div className="bubble-edit-controls">
                        <button
                          type="button"
                          className="btn-save"
                          onClick={() => handleSaveEdit(index)}
                        >
                          <Check size={14} /> Save
                        </button>
                        <button
                          type="button"
                          className="btn-cancel"
                          onClick={handleCancelEdit}
                        >
                          <X size={14} /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bubble-content-text">
                      {msg.content.split("\n").map((line, lIdx) => (
                        <p key={lIdx}>{line}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Message Append Buttons */}
      <div className="chat-editor-controls">
        <button
          type="button"
          className="btn-add-msg user-add"
          onClick={() => handleAddMessage("user")}
        >
          <Plus size={16} /> Add Citizen Message
        </button>
        <button
          type="button"
          className="btn-add-msg assistant-add"
          onClick={() => handleAddMessage("assistant")}
        >
          <Plus size={16} /> Add Cyberwall Response
        </button>
      </div>
    </div>
  );
};
