import type { TestCase } from "../models/test-case";

export function exportToMarkdown(testCases: TestCase[]): string {
  let md = "# Cyberwall Simulation Test Suite\n\n";
  md += `Generated on: ${new Date().toLocaleDateString()}\n`;
  md += `Total Test Cases: ${testCases.length}\n\n`;

  // Add a summary table
  md += "## Test Cases Summary\n\n";
  md += "| ID | Category | Objective | Lang | Input | Type |\n";
  md += "| --- | --- | --- | --- | --- | --- |\n";
  for (const tc of testCases) {
    md += `| ${tc.id} | ${tc.category} | ${tc.objective} | ${tc.language.toUpperCase()} | ${tc.inputType} | ${tc.type} |\n`;
  }
  md += "\n---\n\n";

  // Add detailed sections for each test case
  md += "## Detailed Test Cases\n\n";
  for (const tc of testCases) {
    md += `### ${tc.id}: ${tc.objective}\n\n`;
    md += `- **Category**: ${tc.category}\n`;
    md += `- **Scenario**: ${tc.scenario}\n`;
    md += `- **Language**: ${tc.language === "en" ? "English (en)" : "Malayalam (ml)"}\n`;
    md += `- **Input Type**: ${tc.inputType}\n`;
    md += `- **Test Type**: ${tc.type.toUpperCase()}\n\n`;

    md += "#### Conversation Log\n\n";
    for (const msg of tc.chat) {
      const speaker = msg.role === "user" ? "User 👤" : "Cyberwall Assistant 🛡️";
      md += `**${speaker}**:\n`;
      // For Malayalam, wrap or present cleanly.
      md += `> ${msg.content.replace(/\n/g, "\n> ")}\n\n`;
    }
    md += "---\n\n";
  }

  return md;
}

export function downloadMarkdownFile(testCases: TestCase[], filename = "cyberwall-tests.md") {
  const content = exportToMarkdown(testCases);
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
