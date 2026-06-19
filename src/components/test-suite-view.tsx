import React, { useState, useMemo } from "react";
import type { TestCase } from "../models/test-case";
import { Search, Filter, ChevronDown, ChevronRight, AlertTriangle, Plus } from "lucide-react";

interface TestSuiteViewProps {
  testCases: TestCase[];
  filteredTestCases: TestCase[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddTestCase: () => void;
  onRegenerate: () => void;

  searchTerm: string;
  setSearchTerm: (val: string) => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  selectedLanguage: string;
  setSelectedLanguage: (val: string) => void;
  selectedInputType: string;
  setSelectedInputType: (val: string) => void;
  selectedTestType: string;
  setSelectedTestType: (val: string) => void;
}

export const TestSuiteView: React.FC<TestSuiteViewProps> = ({
  testCases,
  filteredTestCases,
  selectedId,
  onSelect,
  onAddTestCase,
  onRegenerate,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedLanguage,
  setSelectedLanguage,
  selectedInputType,
  setSelectedInputType,
  selectedTestType,
  setSelectedTestType,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "Phone Number Analysis": true, // Expand first by default
  });

  // Compute Categories list and counts
  const categories = useMemo(() => {
    const list = new Set(testCases.map((tc) => tc.category));
    return Array.from(list).sort();
  }, [testCases]);

  // Group filtered test cases by category
  const groupedCases = useMemo(() => {
    const groups: Record<string, TestCase[]> = {};
    for (const tc of filteredTestCases) {
      if (!groups[tc.category]) {
        groups[tc.category] = [];
      }
      groups[tc.category].push(tc);
    }
    return groups;
  }, [filteredTestCases]);

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  };

  return (
    <div className="test-suite-view">
      <div className="sidebar-header">
        <div className="quick-actions">
          <button onClick={onAddTestCase} className="btn-primary flex-center" title="Create New Test Case">
            <Plus size={16} /> New Test
          </button>
          <button onClick={onRegenerate} className="btn-secondary text-xs" title="Reset suite to default generated ones">
            Reset Suite
          </button>
        </div>
      </div>

      {/* Filter and Search Section */}
      <div className="search-filter-section">
        <div className="search-box">
          <Search className="search-icon" size={16} />
          <input
            type="text"
            placeholder="Search test suite ID, chat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <div className="filter-select-group">
            <Filter size={12} className="filter-label-icon" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-select-group">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Langs</option>
              <option value="en">English (en)</option>
              <option value="ml">Malayalam (ml)</option>
            </select>
            <select
              value={selectedInputType}
              onChange={(e) => setSelectedInputType(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Inputs</option>
              <option value="text">Text</option>
              <option value="voice">Voice</option>
              <option value="image">Image</option>
              <option value="mixed">Mixed</option>
            </select>
            <select
              value={selectedTestType}
              onChange={(e) => setSelectedTestType(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Types</option>
              <option value="happy">Happy</option>
              <option value="edge">Edge</option>
              <option value="failure">Failure</option>
              <option value="abuse">Abuse</option>
            </select>
          </div>
        </div>
      </div>

      {/* Categories / Tests List Accordion */}
      <div className="tests-list-container">
        {categories.map((category) => {
          const casesInCategory = groupedCases[category] || [];
          const isExpanded = !!expandedCategories[category];
          
          // Skip category if filter is applied and has no results
          if (selectedCategory !== "all" && selectedCategory !== category) return null;
          if (casesInCategory.length === 0) return null;

          return (
            <div key={category} className="category-accordion-group">
              <div
                className={`category-accordion-header ${isExpanded ? "expanded" : ""}`}
                onClick={() => toggleCategory(category)}
              >
                <div className="category-title">
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <span>{category}</span>
                </div>
                <span className="category-counter">{casesInCategory.length}</span>
              </div>

              {isExpanded && (
                <div className="category-accordion-body">
                  {casesInCategory.map((tc) => {
                    const isSelected = selectedId === tc.id;
                    return (
                      <div
                        key={tc.id}
                        className={`test-case-item ${isSelected ? "selected" : ""}`}
                        onClick={() => onSelect(tc.id)}
                      >
                        <div className="tc-item-header">
                          <span className="tc-item-id">{tc.id}</span>
                          <span className="tc-chat-count">{tc.chat.length} messages</span>
                        </div>
                        <div className="tc-item-category">{tc.objective}</div>
                        <div className="tc-item-snippet">
                          {tc.chat[0]
                            ? `${tc.chat[0].role === "user" ? "Citizen" : "Cyberwall"}: ${tc.chat[0].content}`
                            : tc.objective}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {filteredTestCases.length === 0 && (
          <div className="no-results-state">
            <AlertTriangle size={24} />
            <p>No test cases matching filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};
