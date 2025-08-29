import axios, { AxiosError } from 'axios';
import type { AxiosInstance } from 'axios';
import type { Agent, Task, ApiError, LogEntry } from '../types';

class ApiClient {
  private client: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
    this.loadAuthToken();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config) => {
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.clearAuthToken();
          window.location.href = '/login';
        }
        return Promise.reject(this.handleApiError(error));
      }
    );
  }

  private handleApiError(error: AxiosError): ApiError {
    if (error.response?.data) {
      return error.response.data as ApiError;
    }
    return {
      detail: error.message || 'An unexpected error occurred',
      status_code: error.response?.status || 500,
    };
  }

  private loadAuthToken() {
    this.authToken = localStorage.getItem('auth_token');
  }

  setAuthToken(token: string) {
    this.authToken = token;
    localStorage.setItem('auth_token', token);
  }

  clearAuthToken() {
    this.authToken = null;
    localStorage.removeItem('auth_token');
  }

  getAuthToken() {
    return this.authToken;
  }

  // Health endpoints
  async getHealth() {
    const response = await this.client.get('/api/v1/health');
    return response.data;
  }

  async getReadiness() {
    const response = await this.client.get('/api/v1/ready');
    return response.data;
  }

  async getMetrics() {
    const response = await this.client.get('/api/v1/metrics');
    return response.data;
  }

  // Authentication
  async login(username: string, password: string) {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await this.client.post('/api/v1/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    if (response.data.access_token) {
      this.setAuthToken(response.data.access_token);
    }
    
    return response.data;
  }

  async logout() {
    try {
      await this.client.post('/api/v1/auth/logout');
    } finally {
      this.clearAuthToken();
    }
  }

  async changePassword(currentPassword: string, newPassword: string) {
    const response = await this.client.post('/api/v1/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  }

  // Agent management
  async getAgents(): Promise<Agent[]> {
    const response = await this.client.get('/api/v1/agents');
    return response.data;
  }

  async getAgent(agentId: string): Promise<Agent> {
    const response = await this.client.get(`/api/v1/agents/${agentId}`);
    return response.data;
  }

  async createAgent(agentData: Partial<Agent>): Promise<Agent> {
    const response = await this.client.post('/api/v1/agents/create', agentData);
    return response.data;
  }

  async updateAgent(agentId: string, agentData: Partial<Agent>): Promise<Agent> {
    const response = await this.client.put(`/api/v1/agents/${agentId}`, agentData);
    return response.data;
  }

  async deleteAgent(agentId: string): Promise<void> {
    await this.client.delete(`/api/v1/agents/${agentId}`);
  }

  // Task management
  async getTasks(): Promise<Task[]> {
    const response = await this.client.get('/api/v1/tasks');
    return response.data;
  }

  async getTask(taskId: string): Promise<Task> {
    const response = await this.client.get(`/api/v1/tasks/${taskId}/status`);
    return response.data;
  }

  async runTask(taskData: { agent_id: string; input: Record<string, any> }): Promise<Task> {
    const response = await this.client.post('/api/v1/tasks/run', taskData);
    return response.data;
  }

  async cancelTask(taskId: string): Promise<void> {
    await this.client.delete(`/api/v1/tasks/${taskId}`);
  }

  // Logging
  async getTaskLogs(taskId: string): Promise<LogEntry[]> {
    const response = await this.client.get(`/api/v1/logs/${taskId}`);
    return response.data;
  }

  async getHistoricalLogs(params?: {
    agent_id?: string;
    level?: string;
    search?: string;
    limit?: number;
  }): Promise<LogEntry[]> {
    const response = await this.client.get('/api/v1/logs/history', { params });
    return response.data;
  }

  // Security endpoints
  async getSecurityStatus() {
    const response = await this.client.get('/api/v1/security/status');
    return response.data;
  }

  async getSecurityHealth() {
    const response = await this.client.get('/api/v1/security/health');
    return response.data;
  }

  async getSecurityIncidents(params?: {
    limit?: number;
    severity?: string;
    resolved?: boolean;
    agent_id?: string;
  }) {
    const response = await this.client.get('/api/v1/security/incidents', { params });
    return response.data;
  }

  async resolveSecurityIncident(incidentId: string, resolutionNotes: string) {
    const response = await this.client.post(`/api/v1/security/incidents/${incidentId}/resolve`, {
      resolution_notes: resolutionNotes,
    });
    return response.data;
  }

  async getSecurityLimits() {
    const response = await this.client.get('/api/v1/security/limits');
    return response.data;
  }

  async validateToolExecution(validationData: {
    agent_id: string;
    tool_name: string;
    input_data: Record<string, any>;
  }) {
    const response = await this.client.post('/api/v1/security/validate-tool-execution', validationData);
    return response.data;
  }

  async getAgentSecurityReport(agentId: string) {
    const response = await this.client.get(`/api/v1/security/agents/${agentId}/report`);
    return response.data;
  }

  // System metrics endpoints
  async getSystemMetrics() {
    const response = await this.client.get('/api/v1/system/metrics');
    return response.data;
  }

  async getSystemMetricsCpu() {
    const response = await this.client.get('/api/v1/system/metrics/cpu');
    return response.data;
  }

  async getSystemMetricsMemory() {
    const response = await this.client.get('/api/v1/system/metrics/memory');
    return response.data;
  }

  async getSystemMetricsDisk() {
    const response = await this.client.get('/api/v1/system/metrics/disk');
    return response.data;
  }

  async getSystemMetricsNetwork() {
    const response = await this.client.get('/api/v1/system/metrics/network');
    return response.data;
  }

  async getSystemMetricsGpu() {
    const response = await this.client.get('/api/v1/system/metrics/gpu');
    return response.data;
  }

  // Ollama model management endpoints
  async getOllamaModels() {
    const response = await this.client.get('/api/v1/ollama/models');
    return response.data;
  }

  async getOllamaModelNames() {
    const response = await this.client.get('/api/v1/ollama/models/names');
    return response.data;
  }

  async getOllamaHealth() {
    const response = await this.client.get('/api/v1/ollama/health');
    return response.data;
  }

  async pullOllamaModel(modelName: string) {
    const response = await this.client.post(`/api/v1/ollama/models/pull/${modelName}`);
    return response.data;
  }

  // Dashboard data
  async getDashboardSummary() {
    const response = await this.client.get('/api/v1/dashboard/summary');
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;