import { useState, useMemo, useEffect, useRef } from "react";
import type { TestCase } from "./models/test-case";
import { TestSuiteView } from "./components/test-suite-view";
import { ChatEditor } from "./components/chat-editor";
import { downloadJSONFile, importFromJSON } from "./exporters/json";
import { downloadMarkdownFile } from "./exporters/markdown";
import { downloadXLSXFile } from "./exporters/xlsx";
import initialTests from "../data/generated-tests.json";
import { Menu, FileJson, FileText, Table, ChevronDown } from "lucide-react";

export default function App() {
  // Database state
  const [testCases, setTestCases] = useState<TestCase[]>(initialTests as TestCase[]);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialTests.length > 0 ? initialTests[0].id : null
  );

  // Save status state
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error" | "">("saved");
  const isFirstRender = useRef(true);

  // Autosave effect (debounced)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setSaveStatus("saving");
    const timer = setTimeout(() => {
      fetch("/api/save-tests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(testCases)
      })
        .then((res) => {
          if (res.ok) {
            setSaveStatus("saved");
          } else {
            setSaveStatus("error");
          }
        })
        .catch(() => {
          setSaveStatus("error");
        });
    }, 800);

    return () => clearTimeout(timer);
  }, [testCases]);

  // Filter & Search states (lifted from sidebar to sync both views)
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [selectedInputType, setSelectedInputType] = useState("all");
  const [selectedTestType, setSelectedTestType] = useState("all");

  // Sidebar visibility state (persisted in localStorage)
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem("cyberwall_sidebar_open");
    return saved !== null ? saved === "true" : false;
  });

  // Export dropdown state
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  // Filter test cases reactively
  const filteredTestCases = useMemo(() => {
    return testCases.filter((tc) => {
      const matchesSearch =
        tc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tc.objective.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tc.scenario.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tc.chat.some((msg) => msg.content.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = selectedCategory === "all" || tc.category === selectedCategory;
      const matchesLanguage = selectedLanguage === "all" || tc.language === selectedLanguage;
      const matchesInputType = selectedInputType === "all" || tc.inputType === selectedInputType;
      const matchesTestType = selectedTestType === "all" || tc.type === selectedTestType;

      return matchesSearch && matchesCategory && matchesLanguage && matchesInputType && matchesTestType;
    });
  }, [testCases, searchTerm, selectedCategory, selectedLanguage, selectedInputType, selectedTestType]);

  // Update a specific test case's chat log
  const handleUpdateChat = (id: string, updatedChat: any) => {
    setTestCases((prev) =>
      prev.map((tc) => (tc.id === id ? { ...tc, chat: updatedChat } : tc))
    );
  };

  // Add a new test case
  const handleAddTestCase = () => {
    const prefix = "CUSTOM";
    const customTests = testCases.filter((tc) => tc.id.startsWith(prefix));
    const nextNum = customTests.length + 1;
    const newId = `${prefix}-${String(nextNum).padStart(3, "0")}`;

    const newCase: TestCase = {
      id: newId,
      category: "Phone Number Analysis",
      objective: "New test case objective",
      scenario: "Describe the user scenario here",
      language: "en",
      inputType: "text",
      type: "happy",
      chat: [
        { role: "user", content: "Is this number safe?" },
        { role: "assistant", content: "Trust Score: 50/100 (Neutral)\n\nReasoning: We found no adverse reports." },
      ],
      expectedBehavior: [],
    };

    setTestCases((prev) => [...prev, newCase]);
    
    // Automatically scroll to and highlight the newly added test case
    setTimeout(() => {
      handleSelectTestCase(newId);
    }, 150);
  };

  // Delete a test case
  const handleDeleteTestCase = (id: string) => {
    if (window.confirm(`Are you sure you want to delete test case ${id}?`)) {
      setTestCases((prev) => prev.filter((tc) => tc.id !== id));
      if (selectedId === id) {
        setSelectedId(null);
      }
    }
  };

  // Navigate and scroll to a specific chat log card smoothly
  const handleSelectTestCase = (id: string) => {
    setSelectedId(id);
    const element = document.getElementById(`tc-card-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      
      // Temporary premium highlight flash
      const borderPrev = element.style.borderColor;
      const shadowPrev = element.style.boxShadow;
      
      element.style.borderColor = "var(--color-primary)";
      element.style.boxShadow = "0 0 16px rgba(79, 70, 229, 0.35)";
      
      setTimeout(() => {
        element.style.borderColor = borderPrev;
        element.style.boxShadow = shadowPrev;
      }, 1200);
    }
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const imported = importFromJSON(text);
        if (imported.length > 0) {
          setTestCases(imported);
          setSelectedId(imported[0].id);
          alert(`Successfully imported ${imported.length} test cases!`);
        }
      } catch (err: any) {
        alert(`Error importing JSON: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleExportJSON = () => {
    downloadJSONFile(testCases);
  };

  const handleExportMD = () => {
    downloadMarkdownFile(testCases);
  };

  const handleExportXLSX = () => {
    downloadXLSXFile(testCases);
  };

  const handleRegenerate = () => {
    if (window.confirm("Are you sure you want to reset the test suite? Any custom modifications will be lost.")) {
      setTestCases(initialTests as TestCase[]);
      if (initialTests.length > 0) {
        setSelectedId(initialTests[0].id);
      }
    }
  };

  return (
    <div className={`app-container ${sidebarOpen ? "sidebar-expanded" : "sidebar-collapsed"}`}>
      {/* Column 1: Test Suite View & Sidebar */}
      <TestSuiteView
        testCases={testCases}
        filteredTestCases={filteredTestCases}
        selectedId={selectedId}
        onSelect={handleSelectTestCase}
        onAddTestCase={handleAddTestCase}
        onRegenerate={handleRegenerate}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
        selectedInputType={selectedInputType}
        setSelectedInputType={setSelectedInputType}
        selectedTestType={selectedTestType}
        setSelectedTestType={setSelectedTestType}
      />

      {/* Column 2: Visual Editor & Chat log (Scrollable Stack) */}
      <div className="editor-workspace-middle" style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", padding: 0 }}>
        
        {/* Sticky Global Top Header */}
        <div className="global-header" style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 24px",
          zIndex: 10,
          position: "sticky",
          top: 0
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Hamburger Collapse Menu Button */}
            <button
              type="button"
              onClick={() => {
                setSidebarOpen((prev) => {
                  const nextVal = !prev;
                  localStorage.setItem("cyberwall_sidebar_open", String(nextVal));
                  return nextVal;
                });
              }}
              style={{
                background: "none",
                border: "none",
                padding: "6px",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                cursor: "pointer",
                transition: "background var(--transition-fast), color var(--transition-fast)"
              }}
              className="sidebar-toggle-btn"
              title="Toggle Sidebar"
            >
              <Menu size={20} />
            </button>
            
            <div>
              <h1 style={{ fontSize: "20px", fontWeight: 900, fontFamily: "var(--font-display)", letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: "8px" }}>
                Cyberwall AI Example chats
                {saveStatus === "saving" && (
                  <span style={{ fontSize: "11px", fontWeight: 500, padding: "2px 8px", borderRadius: "12px", backgroundColor: "#fef3c7", color: "#d97706", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <span className="save-pulse-dot" style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#d97706" }}></span>
                    Saving...
                  </span>
                )}
                {saveStatus === "saved" && (
                  <span style={{ fontSize: "11px", fontWeight: 500, padding: "2px 8px", borderRadius: "12px", backgroundColor: "#dcfce7", color: "#16a34a", display: "inline-flex", alignItems: "center", gap: "4px" }} title="Your changes are synced back to generated-tests.json on disk">
                    <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#16a34a" }}></span>
                    Synced to disk
                  </span>
                )}
                {saveStatus === "error" && (
                  <span style={{ fontSize: "11px", fontWeight: 500, padding: "2px 8px", borderRadius: "12px", backgroundColor: "#fee2e2", color: "#dc2626", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#dc2626" }}></span>
                    Sync Error
                  </span>
                )}
              </h1>
              <p style={{ fontSize: "12px", marginTop: "2px" }}>
                Showing {filteredTestCases.length} of {testCases.length} simulation chats
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center", position: "relative" }}>
            {/* Import Button */}
            <label className="btn-file-import" style={{ padding: "6px 12px", fontSize: "12px", height: "32px", display: "inline-flex", alignItems: "center", cursor: "pointer" }}>
              <FileJson size={14} /> Import JSON
              <input type="file" accept=".json" onChange={handleImportJSON} style={{ display: "none" }} />
            </label>

            {/* Export Dropdown Group */}
            <div style={{ position: "relative" }}>
              <button
                type="button"
                className="btn-primary"
                onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                style={{ height: "32px", padding: "6px 12px", fontSize: "12px" }}
              >
                Export Suite <ChevronDown size={14} />
              </button>

              {exportDropdownOpen && (
                <>
                  {/* Backdrop click-to-close handler */}
                  <div
                    onClick={() => setExportDropdownOpen(false)}
                    style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "38px",
                      backgroundColor: "var(--color-canvas)",
                      border: "1px solid #dcdfd9",
                      borderRadius: "var(--radius-md)",
                      boxShadow: "0 4px 12px rgba(14, 15, 12, 0.08)",
                      zIndex: 101,
                      display: "flex",
                      flexDirection: "column",
                      width: "160px",
                      padding: "4px 0",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        handleExportJSON();
                        setExportDropdownOpen(false);
                      }}
                      style={{
                        padding: "8px 12px",
                        textAlign: "left",
                        width: "100%",
                        background: "none",
                        border: "none",
                        color: "var(--color-ink)",
                        fontSize: "12px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        justifyContent: "flex-start",
                      }}
                      className="dropdown-item"
                    >
                      <FileJson size={13} /> JSON Format
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleExportMD();
                        setExportDropdownOpen(false);
                      }}
                      style={{
                        padding: "8px 12px",
                        textAlign: "left",
                        width: "100%",
                        background: "none",
                        border: "none",
                        color: "var(--color-ink)",
                        fontSize: "12px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        justifyContent: "flex-start",
                      }}
                      className="dropdown-item"
                    >
                      <FileText size={13} /> Markdown Report
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleExportXLSX();
                        setExportDropdownOpen(false);
                      }}
                      style={{
                        padding: "8px 12px",
                        textAlign: "left",
                        width: "100%",
                        background: "none",
                        border: "none",
                        color: "var(--color-ink)",
                        fontSize: "12px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        justifyContent: "flex-start",
                      }}
                      className="dropdown-item"
                    >
                      <Table size={13} /> Excel Sheet
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable list of Chats */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }} className="editor-workspace-middle-scroll">
          {filteredTestCases.length === 0 ? (
            <div className="welcome-splash" style={{ gridColumn: "auto", height: "100%" }}>
              <div className="welcome-card">
                <h2>No results found</h2>
                <p>Try clearing some filters or click below to add a custom test case.</p>
                <button onClick={handleAddTestCase} className="btn-primary">
                  Add New Test Case
                </button>
              </div>
            </div>
          ) : (
            <div className="editor-wrapper-box" style={{ background: "none", border: "none", boxShadow: "none", gap: "24px" }}>
              {filteredTestCases.map((tc) => (
                <ChatEditor
                  key={tc.id}
                  testCase={tc}
                  onChange={(updatedChat) => handleUpdateChat(tc.id, updatedChat)}
                  onDelete={() => handleDeleteTestCase(tc.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
