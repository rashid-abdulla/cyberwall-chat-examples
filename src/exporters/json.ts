import type { TestCase } from "../models/test-case";

export function exportToJSON(testCases: TestCase[]): string {
  return JSON.stringify(testCases, null, 2);
}

export function importFromJSON(jsonString: string): TestCase[] {
  const data = JSON.parse(jsonString);
  if (!Array.isArray(data)) {
    throw new Error("Invalid JSON: Root must be an array of test cases.");
  }
  
  // Basic validation of fields
  for (const tc of data) {
    if (
      !tc.id ||
      !tc.category ||
      !tc.objective ||
      !tc.scenario ||
      !tc.language ||
      !tc.inputType ||
      !tc.type ||
      !Array.isArray(tc.chat) ||
      !Array.isArray(tc.expectedBehavior)
    ) {
      throw new Error(`Invalid TestCase format in item: ${tc.id || "Unknown ID"}`);
    }
  }
  
  return data as TestCase[];
}

export function downloadJSONFile(testCases: TestCase[], filename = "cyberwall-tests.json") {
  const content = exportToJSON(testCases);
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
