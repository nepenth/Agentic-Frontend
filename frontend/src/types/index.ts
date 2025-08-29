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

// Security-related types
export interface SecurityStatus {
  active_agents: number;
  total_incidents: number;
  recent_incidents: SecurityIncident[];
  resource_limits: {
    max_concurrent_agents: number;
    max_memory_mb: number;
    max_execution_time: number;
  };
  current_usage: {
    active_agents: number;
    total_memory_mb: number;
  };
}

export interface SecurityIncident {
  incident_id: string;
  agent_id: string;
  agent_type?: string;
  violation_type: 'RESOURCE_EXCEEDED' | 'PERMISSION_DENIED' | 'MALICIOUS_CONTENT' | 'RATE_LIMIT_EXCEEDED' | 'SCHEMA_VIOLATION' | 'EXECUTION_TIMEOUT';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: string;
  resolved: boolean;
  resolution_notes?: string;
}

export interface SecurityHealth {
  status: 'healthy' | 'warning' | 'error';
  message: string;
  metrics: {
    total_incidents: number;
    active_agents: number;
    unresolved_high_severity: number;
  };
  timestamp: string;
}

export interface SecurityLimits {
  concurrent_agents: {
    current: number;
    max: number;
  };
  execution_time: {
    current: number;
    max: number;
  };
  memory_usage: {
    current_mb: number;
    max_mb: number;
  };
  rate_limits: {
    tool_execution_per_hour: number;
    agent_creation_per_hour: number;
    external_requests_per_hour: number;
  };
}

export interface AgentSecurityReport {
  agent_id: string;
  agent_type: string;
  start_time: string;
  resource_usage: {
    memory_peak_mb: number;
    cpu_time_seconds: number;
    execution_time: number;
  };
  security_events: Array<{
    type: string;
    description: string;
    timestamp: string;
  }>;
  incidents: SecurityIncident[];
  is_secure: boolean;
}

export interface ToolValidationRequest {
  agent_id: string;
  tool_name: string;
  input_data: Record<string, any>;
}

export interface ToolValidationResponse {
  allowed: boolean;
  agent_id: string;
  tool_name: string;
  validation_time: number;
  errors?: string[];
}