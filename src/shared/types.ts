export type FieldContext = {
  id: string;
  questionText: string;
  fieldType: string;
  platform: string;
  url: string;
};

export type MemoryEntry = {
  id: string;
  questionText: string;
  answerText: string;
  createdAt: string;
};

export type MemoryEntryInput = {
  questionText: string;
  answerText: string;
};

export type MemoryEntryUpdate = {
  id: string;
  questionText?: string;
  answerText?: string;
};

export type Suggestion = {
  entry: MemoryEntry;
  score: number;
};

export type ExportJsonResult = {
  json: string;
};

export type ImportJsonPayload = {
  json: string;
};
