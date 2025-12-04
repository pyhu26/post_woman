export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface KeyValue {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface Request {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  headers: KeyValue[];
  params: KeyValue[];
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  requests: Request[];
  folders: Folder[];
  createdAt: string;
}

export interface Collection {
  id: string;
  name: string;
  folders: Folder[];
  requests: Request[];
  createdAt: string;
  updatedAt: string;
}

export interface RequestResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  time: number;
}

// Request Chain Types
export interface ChainStep {
  id: string;
  request: Request;
  order: number;
}

export interface ChainStepResult {
  stepId: string;
  request: Request;
  response: RequestResponse | null;
  error: string | null;
  status: 'pending' | 'running' | 'success' | 'error';
}

export interface RequestChain {
  id: string;
  name: string;
  steps: ChainStep[];
  createdAt: string;
  updatedAt: string;
}

export interface ChainExecutionResult {
  chainId: string;
  results: ChainStepResult[];
  totalTime: number;
  success: boolean;
}
