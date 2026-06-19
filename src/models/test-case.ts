export type InputType = "text" | "voice" | "image" | "mixed";
export type Language = "en" | "ml";
export type TestCaseType = "happy" | "edge" | "failure" | "abuse";

export interface ChatMessage {
  id?: string; // Optional unique ID for React keys and reordering
  role: "user" | "assistant";
  content: string;
}

export interface TestCase {
  id: string;
  category: string;
  objective: string;
  scenario: string;
  language: Language;
  inputType: InputType;
  type: TestCaseType; // Happy, Edge, Failure, or Abuse
  chat: ChatMessage[];
  expectedBehavior: string[];
  author: string;
}
