import * as XLSX from "xlsx";
import type { TestCase } from "../models/test-case";

export function exportToXLSX(testCases: TestCase[]): ArrayBuffer {
  const data = testCases.map((tc) => {
    // Format chat conversation into a readable text format
    const chatString = tc.chat
      .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join("\n\n");

    // Format expected behaviors
    return {
      ID: tc.id,
      Category: tc.category,
      Objective: tc.objective,
      Scenario: tc.scenario,
      Language: tc.language.toUpperCase(),
      "Input Type": tc.inputType,
      "Test Type": tc.type.toUpperCase(),
      Chat: chatString,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Cyberwall Tests");

  // Adjust column widths for better readability
  const maxW = 50;
  worksheet["!cols"] = [
    { wch: 12 }, // ID
    { wch: 25 }, // Category
    { wch: 30 }, // Objective
    { wch: 35 }, // Scenario
    { wch: 10 }, // Language
    { wch: 12 }, // Input Type
    { wch: 12 }, // Test Type
    { wch: maxW }, // Chat
  ];

  // Write as binary array
  return XLSX.write(workbook, { bookType: "xlsx", type: "array" });
}

export function downloadXLSXFile(testCases: TestCase[], filename = "cyberwall-tests.xlsx") {
  const buffer = exportToXLSX(testCases);
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
