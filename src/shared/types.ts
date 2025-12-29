export interface FieldContext {
  id?: string;
  label?: string;
  value?: string;
}

export interface MemoryEntry {
  id: string;
  createdAt: string;
  value: string;
}

export interface PingMessage {
  type: 'PING';
}

export interface PongMessage {
  type: 'PONG';
}
