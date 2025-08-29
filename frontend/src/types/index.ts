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

// System metrics types
export interface SystemMetrics {
  timestamp: string;
  cpu: CpuMetrics;
  memory: MemoryMetrics;
  gpu: GpuMetrics[];
}

export interface CpuMetrics {
  usage_percent: number;
  frequency_mhz: {
    current: number;
    min: number;
    max: number;
  };
  count: {
    physical: number;
    logical: number;
  };
}

export interface MemoryMetrics {
  total_gb: number;
  used_gb: number;
  usage_percent: number;
}

export interface GpuMetrics {
  index: number;
  name: string;
  utilization: {
    gpu_percent: number;
    memory_percent: number;
  };
  memory: {
    used_mb: number;
    total_mb: number;
  };
  temperature_fahrenheit: number;
  power: {
    usage_watts: number;
    limit_watts: number;
  };
}

export interface DiskMetrics {
  total_gb: number;
  used_gb: number;
  usage_percent: number;
  read_speed_mbps: number;
  write_speed_mbps: number;
}

export interface NetworkMetrics {
  interfaces: NetworkInterface[];
  total_received_mb: number;
  total_transmitted_mb: number;
}

export interface NetworkInterface {
  name: string;
  received_mb: number;
  transmitted_mb: number;
  speed_mbps: number;
}

// Ollama model management types
export interface OllamaModel {
  name: string;
  size: number;
  modified_at: string;
  digest: string;
}

export interface OllamaModelsResponse {
  models: OllamaModel[];
}

export interface OllamaModelNamesResponse {
  models: string[];
}

export interface OllamaHealthResponse {
  status: string;
  models_available: number;
  default_model: string;
}

export interface OllamaPullResponse {
  status: string;
  message: string;
  model_name: string;
}