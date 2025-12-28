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

export type PingMessage = {
  type: 'PING';
};

export type PongResponse = {
  type: 'PONG';
};
