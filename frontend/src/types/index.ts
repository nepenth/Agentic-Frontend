export interface User {
  id: string;
  username: string;
  email?: string;
  isAuthenticated: boolean;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  model_name: string;
  config: {
    temperature: number;
    max_tokens: number;
    system_prompt: string;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  agent_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input: Record<string, any>;
  output?: Record<string, any>;
  created_at: string;
  completed_at?: string;
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'summary' | 'chart' | 'list' | 'metric';
  data: any;
  position: { x: number; y: number; w: number; h: number };
}

export interface LogEntry {
  level: 'debug' | 'info' | 'warning' | 'error';
  message: string;
  timestamp: string;
  task_id?: string;
  agent_id?: string;
}

export interface ApiError {
  detail: string;
  status_code: number;
}

export interface BackendEndpoint {
  service: string;
  url: string;
  description: string;
  icon: string;
}