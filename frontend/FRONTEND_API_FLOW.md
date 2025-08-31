# Frontend API Flow Documentation

This document provides a comprehensive overview of all external API calls and WebSocket connections used throughout the frontend application. It serves as a source of truth for understanding current API usage patterns, facilitating backend API issue diagnosis and frontend API updates based on backend changes.

## Table of Contents

1. [API Service Overview](#api-service-overview)
2. [Authentication Flow](#authentication-flow)
3. [Page/Component API Usage](#pagecomponent-api-usage)
4. [WebSocket Connections](#websocket-connections)
5. [Error Handling Patterns](#error-handling-patterns)
6. [API Endpoints Reference](#api-endpoints-reference)

## API Service Overview

The frontend uses a centralized `ApiClient` class (`frontend/src/services/api.ts`) that handles all HTTP communication with the backend. Key features:

- **Base URL**: Configurable via `VITE_API_BASE_URL` environment variable
- **Authentication**: JWT token-based with automatic header injection
- **Error Handling**: Centralized error processing with CORS and network error handling
- **Interceptors**: Request/response interceptors for auth and error handling
- **Timeout**: 30-second timeout for all requests

## Recent Frontend Improvements

### Scroll Bar Fixes (✅ IMPLEMENTED)
**Issue:** Pages were not displaying scroll bars when content overflowed
**Root Cause:** Conflicting CSS with `display: flex` and `place-items: center` on body element
**Solution:**
- Removed `display: flex` and `place-items: center` from body element
- Added `overflow: auto` to both html and body elements
- Simplified #root container styling to allow proper height management
- **Files Modified:** `frontend/src/index.css`, `frontend/src/App.css`

### GPU Display Debugging (✅ IMPLEMENTED)
**Issue:** Only one GPU was displaying despite API returning data for multiple GPUs
**Root Cause:** Syntax error in GPU rendering code
**Solution:**
- Fixed syntax error with extra `);` in map function
- Added comprehensive console logging for GPU processing and rendering
- Improved React keys for proper component re-rendering: `key={`gpu-${gpu.id}-${_index}`}`
- **Files Modified:** `frontend/src/pages/SystemHealth.tsx`

### GPU Data Flow
**Backend Response Format:**
```json
[
  {
    "index": 0,
    "name": "Tesla P40",
    "utilization": {"gpu_percent": 0, "memory_percent": 0},
    "memory": {"total_mb": 24576, "used_mb": 139, "free_mb": 24436},
    "temperature_fahrenheit": 75.2,
    "clocks": {"graphics_mhz": 544, "memory_mhz": 405},
    "power": {"usage_watts": 9.82, "limit_watts": 250.0}
  },
  {
    "index": 1,
    "name": "Tesla P40",
    "utilization": {"gpu_percent": 0, "memory_percent": 0},
    "memory": {"total_mb": 24576, "used_mb": 139, "free_mb": 24436},
    "temperature_fahrenheit": 69.8,
    "clocks": {"graphics_mhz": 544, "memory_mhz": 405},
    "power": {"usage_watts": 9.82, "limit_watts": 250.0}
  }
]
```

**Frontend Processing:**
- Maps GPU array to display format with proper unit conversions (MB to GB)
- Handles missing data gracefully with fallbacks
- Provides debugging information for troubleshooting

### Authentication Implementation

```typescript
// Automatic token injection via request interceptor
this.client.interceptors.request.use(
  (config) => {
    if (this.authToken) {
      config.headers.Authorization = `Bearer ${this.authToken}`;
    }
    return config;
  }
);
```

## Authentication Flow

### Login Process
1. **Frontend**: `apiClient.login(username, password)`
2. **Backend**: `POST /api/v1/auth/login`
3. **Response**: Returns `access_token` which is stored in localStorage
4. **WebSocket**: Automatically connects to `/ws/logs` with token
5. **Redirect**: User redirected to dashboard on success

### Logout Process
1. **Frontend**: `apiClient.logout()`
2. **Backend**: `POST /api/v1/auth/logout`
3. **Cleanup**: Token removed from localStorage
4. **WebSocket**: Connection automatically disconnected
5. **Redirect**: User redirected to login page

### Token Management
- **Storage**: localStorage (`auth_token` key)
- **Validation**: Automatic on each request via interceptor
- **Expiration**: Handled by backend, frontend redirects to login on 401

## Page/Component API Usage

### Dashboard (`frontend/src/pages/Dashboard.tsx`)

**Primary APIs:**
- `getAgents()` - Fetches all agents for statistics and recent tasks
- `getTasks()` - Retrieves task list for recent activity display
- `getSecurityStatus()` - Security metrics and active agent count
- `getSystemMetrics()` - CPU, memory, GPU metrics for system health card
- `getOllamaHealth()` - Ollama service status and model information

**Usage Pattern:**
```typescript
const { data: agents, isLoading } = useQuery({
  queryKey: ['agents'],
  queryFn: () => apiClient.getAgents(),
  refetchInterval: 30000, // Refetch every 30 seconds
});
```

**Real-time Updates:** None currently implemented

### System Health (`frontend/src/pages/SystemHealth.tsx`)

**Primary APIs:**
- `getSystemMetricsCpu()` - CPU usage, temperature, frequency
- `getSystemMetricsMemory()` - Memory usage statistics
- `getSystemMetricsDisk()` - Disk I/O and usage metrics
- `getSystemMetricsNetwork()` - Network traffic and speed metrics
- `getSystemMetricsGpu()` - GPU utilization (NVIDIA Tesla P40 × 2)
- `getSystemMetricsLoad()` - System load averages
- `getSystemMetricsSwap()` - Swap memory usage
- `getSystemInfo()` - System uptime, processes, boot time
- `getOllamaHealth()` - Ollama service health status

**Usage Pattern:**
```typescript
const [cpuMetrics, memoryMetrics, ...] = await Promise.all([
  apiClient.getSystemMetricsCpu().catch(() => null),
  apiClient.getSystemMetricsMemory().catch(() => null),
  // ... other metrics
]);
```

**GPU Data Processing:**
```typescript
// Backend returns array of GPUs
// Example response: [{"index":0,"name":"Tesla P40",...},{"index":1,"name":"Tesla P40",...}]

// Frontend transforms to display format
gpus: Array.isArray(gpuMetrics) ? gpuMetrics.map((gpu: any) => ({
  id: gpu.index,
  name: gpu.name,
  usage: gpu.utilization?.gpu_percent || 0,
  memoryUsed: gpu.memory?.used_mb ? gpu.memory.used_mb / 1024 : 0,
  memoryTotal: gpu.memory?.total_mb ? gpu.memory.total_mb / 1024 : 0,
  temperature: gpu.temperature_fahrenheit || 'N/A',
  frequency: gpu.clocks?.graphics_mhz || 'N/A',
  memoryFrequency: gpu.clocks?.memory_mhz || 'N/A',
  power: gpu.power?.usage_watts || 'N/A',
})) : []
```

**Debugging Features:**
- Console logging for GPU processing: `console.log('Processing GPU data:', gpu)`
- Console logging for GPU rendering: `console.log('Rendering GPU:', gpu.id, gpu.name, 'Index in array:', _index)`
- Unique keys for React rendering: `key={`gpu-${gpu.id}-${_index}`}`

**Real-time Updates:** None currently implemented

### Agent Management (`frontend/src/pages/AgentManagement.tsx`)

**Primary APIs:**
- `getAgents()` - List all agents with filtering
- `getOllamaModelNames()` - Available Ollama models for agent creation
- `createAgent()` - Create new static/dynamic agents
- `updateAgent()` - Modify existing agent configuration
- `deleteAgent()` - Remove agents from system

**CRUD Operations:**
```typescript
// Create
const createAgentMutation = useMutation({
  mutationFn: (agentData: Partial<Agent>) => apiClient.createAgent(agentData),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['agents'] });
  },
});

// Update
const updateAgentMutation = useMutation({
  mutationFn: ({ id, data }: { id: string; data: Partial<Agent> }) =>
    apiClient.updateAgent(id, data),
});

// Delete
const deleteAgentMutation = useMutation({
  mutationFn: (id: string) => apiClient.deleteAgent(id),
});
```

**Real-time Updates:** None currently implemented

### Security Center (`frontend/src/pages/Security.tsx`)

**Primary APIs:**
- `getSecurityStatus()` - Current security metrics, active agents, and resource limits
- `getSecurityHealth()` - Security service health status
- `getSecurityIncidents()` - List security incidents with filtering
- `resolveSecurityIncident()` - Resolve security incidents with notes

**Note:** Resource limits are included in the SecurityStatus response (`resource_limits` field) rather than a separate endpoint.

**Usage Pattern:**
```typescript
const {
  data: incidents,
  isLoading,
  refetch,
} = useQuery({
  queryKey: ['security-incidents', incidentFilters],
  queryFn: () => apiClient.getSecurityIncidents({
    limit: incidentFilters.limit,
    severity: incidentFilters.severity !== 'all' ? incidentFilters.severity : undefined,
    resolved: incidentFilters.resolved !== 'all' ? incidentFilters.resolved === 'true' : undefined,
  }),
  refetchInterval: 30000,
});
```

**Real-time Updates:** None currently implemented

### Real-Time Logs Viewer (`frontend/src/components/LogsViewer.tsx`)

**Primary WebSocket Connection:**
- `/ws/logs` - Real-time log streaming with JWT authentication

**Features:**
- **Multi-channel log management**: Create separate channels for different log streams
- **Advanced filtering**: Filter by agent_id, task_id, and log level
- **Real-time updates**: Live log streaming from backend agents
- **Auto-scroll**: Automatic scrolling to latest logs with manual override
- **Log persistence**: Configurable maximum log count per channel

**WebSocket Usage:**
```typescript
// Subscribe to logs with filters
const unsubscribe = webSocketService.subscribeToLogs(
  (logEntry) => {
    // Handle incoming log messages
    updateChannelLogs(logEntry);
  },
  {
    agent_id: 'specific-agent-id',
    level: 'info'
  }
);

// Cleanup on component unmount
unsubscribe();
```

**Channel Management:**
- **All Logs**: Default channel showing all incoming logs
- **Custom Channels**: User-created channels with specific filters
- **Channel Filters**: Agent-specific, task-specific, or level-specific log streams
- **Visual Indicators**: Color-coded channels with log count badges

**Real-time Updates:** ✅ **Fully implemented with WebSocket streaming**

## WebSocket Connections

### WebSocket Service (`frontend/src/services/websocket.ts`)

**Configuration:**
- **Base URL**: `VITE_WS_URL` environment variable
- **Authentication**: JWT token via query parameter (`?token=JWT_TOKEN`)
- **Reconnection**: Automatic with exponential backoff (max 5 attempts)
- **Message Handling**: Event-driven with typed message handlers

#### 📋 **CONFIRMED SPECIFICATIONS SUMMARY**

| Specification | Value | Implementation Status |
|---------------|-------|----------------------|
| **Heartbeat** | ✅ 30-second ping/pong | ✅ **Fully Implemented** |
| **Connection Limits** | ✅ 50 per user, 200 global | ✅ **Client Awareness** |
| **Rate Limiting** | ✅ 100 messages/minute | ✅ **Client-Side Limiting** |
| **Authentication** | ✅ JWT required | ✅ **Query Parameter** |
| **Protocol** | ✅ Raw WebSocket | ✅ **Native API** |
| **Connection Timeout** | ✅ 90 seconds | ✅ **Auto-Disconnect** |

### Available Endpoints

#### 1. Logs Stream (`/ws/logs`)
**Purpose:** Real-time log streaming for monitoring agent activities
**Authentication:** Required (JWT token)
**Parameters:**
- `agent_id` (optional): Filter logs by specific agent
- `task_id` (optional): Filter logs by specific task
- `level` (optional): Filter by log level (debug, info, warning, error)

**Message Format (Backend Specification):**
```json
{
  "type": "log_entry",
  "data": {
    "timestamp": "2024-01-01T12:00:00Z",
    "level": "info|warning|error|debug",
    "message": "Log message content",
    "agent_id": "optional-agent-uuid",
    "task_id": "optional-task-uuid",
    "source": "pipeline|agent|system"
  }
}
```

**Supported Log Levels:** `debug`, `info`, `warning`, `error`
**Supported Sources:** `pipeline`, `agent`, `system`

**Current Usage:**
- ✅ **Authentication flow**: Connected during login/logout in auth flow
- ✅ **Real-time logs viewer**: Used in LogsViewer component for live log streaming
- ✅ **Channel filtering**: Supports agent-specific, task-specific, and level-based filtering
- ✅ **Multi-channel management**: Multiple concurrent log streams with independent filters

#### 2. Task Monitoring (`/ws/tasks/{task_id}`)
**Purpose:** Real-time task progress and status updates
**Authentication:** Required (JWT token)
**Parameters:** Task ID in URL path

**Message Types:**
- `task_status`: Current task status
- `task_progress`: Progress percentage and messages
- `task_complete`: Task completion notification

**Message Format:**
```json
{
  "type": "task_status",
  "data": {
    "task_id": "task-uuid",
    "status": "running",
    "progress": 45,
    "message": "Processing step 3 of 5",
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

**Current Usage:** Not currently used in frontend, but infrastructure ready.

### WebSocket Connection Flow

```typescript
// Connection with authentication
const token = apiClient.getAuthToken();
webSocketService.connect('logs', token || undefined);

// Subscription to logs
const unsubscribe = webSocketService.subscribeToLogs(
  (logEntry) => {
    console.log('New log:', logEntry);
  },
  {
    agent_id: 'specific-agent-id',
    level: 'info'
  }
);

// Cleanup
unsubscribe();
```

### Heartbeat Mechanism (✅ IMPLEMENTED)

The WebSocket service now includes automatic heartbeat management:

- **Ping Interval**: Sends ping messages every 30 seconds
- **Pong Response**: Handles pong messages with timestamps
- **Connection Timeout**: Automatically disconnects after 90 seconds of no pong response
- **Auto-Reconnection**: Triggers reconnection on heartbeat failure

### Rate Limiting (✅ IMPLEMENTED)

Client-side rate limiting prevents exceeding backend limits:

- **Message Limit**: Maximum 100 messages per minute per connection
- **Client-Side Tracking**: Monitors message count and enforces limits
- **Rate Limit Warnings**: Logs warnings when approaching limits
- **Error Handling**: Gracefully handles rate limit error responses from backend

### Server-Sent Events (SSE) Alternative

**Endpoint:** `GET /api/v1/logs/stream/{task_id}`
**Purpose:** Alternative to WebSocket for real-time log streaming
**Authentication:** JWT token in Authorization header
**Advantages:** Simpler to implement, better firewall compatibility
**Usage:**
```javascript
const eventSource = new EventSource('/api/v1/logs/stream/your-task-id', {
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  }
});

eventSource.onmessage = function(event) {
  const logData = JSON.parse(event.data);
  console.log('SSE Log:', logData);
};

eventSource.onerror = function(error) {
  console.error('SSE Error:', error);
};
```

## Error Handling Patterns

### Network Errors
```typescript
// Handled in ApiClient
if (error.code === 'ERR_NETWORK') {
  return {
    detail: 'Network error: Unable to connect to the server',
    status_code: 0,
  };
}
```

### CORS Errors
```typescript
if (error.response.status === 0) {
  return {
    detail: 'CORS error: Server not configured for this origin',
    status_code: 0,
  };
}
```

### Authentication Errors
```typescript
// Automatic redirect on 401
if (error.response?.status === 401) {
  this.clearAuthToken();
  window.location.href = '/login';
}
```

### Component-Level Error Handling
```typescript
const { data, error, refetch } = useQuery({
  queryKey: ['data'],
  queryFn: () => apiClient.getData(),
});

if (error) {
  return (
    <Alert severity="error" action={
      <Button onClick={() => refetch()}>Retry</Button>
    }>
      Failed to load data
    </Alert>
  );
}
```

## API Endpoints Reference

### Core Endpoints
| Method | Endpoint | Purpose | Used By |
|--------|----------|---------|---------|
| `GET` | `/api/v1/health` | System health check | Auth validation |
| `GET` | `/api/v1/ready` | Readiness check | - |
| `GET` | `/api/v1/metrics` | Prometheus metrics | - |

### Authentication
| Method | Endpoint | Purpose | Used By |
|--------|----------|---------|---------|
| `POST` | `/api/v1/auth/login` | User login | Login page |
| `POST` | `/api/v1/auth/logout` | User logout | Auth flow |
| `POST` | `/api/v1/auth/change-password` | Password change | Settings page |

### Agent Management
| Method | Endpoint | Purpose | Used By |
|--------|----------|---------|---------|
| `GET` | `/api/v1/agents` | List agents | Dashboard, AgentManagement |
| `GET` | `/api/v1/agents/{id}` | Get specific agent | - |
| `POST` | `/api/v1/agents/create` | Create agent | AgentManagement |
| `PUT` | `/api/v1/agents/{id}` | Update agent | AgentManagement |
| `DELETE` | `/api/v1/agents/{id}` | Delete agent | AgentManagement |

### Task Management
| Method | Endpoint | Purpose | Used By |
|--------|----------|---------|---------|
| `GET` | `/api/v1/tasks` | List tasks | Dashboard |
| `GET` | `/api/v1/tasks/{id}/status` | Get task status | - |
| `POST` | `/api/v1/tasks/run` | Execute task | - |
| `DELETE` | `/api/v1/tasks/{id}` | Cancel task | - |

### System Monitoring
| Method | Endpoint | Purpose | Used By |
|--------|----------|---------|---------|
| `GET` | `/api/v1/system/metrics` | All system metrics | Dashboard |
| `GET` | `/api/v1/system/metrics/cpu` | CPU metrics | SystemHealth |
| `GET` | `/api/v1/system/metrics/memory` | Memory metrics | SystemHealth |
| `GET` | `/api/v1/system/metrics/disk` | Disk metrics | SystemHealth |
| `GET` | `/api/v1/system/metrics/network` | Network metrics | SystemHealth |
| `GET` | `/api/v1/system/metrics/gpu` | GPU metrics | SystemHealth, Dashboard |
| `GET` | `/api/v1/system/metrics/load` | Load averages | SystemHealth |
| `GET` | `/api/v1/system/metrics/swap` | Swap metrics | SystemHealth |
| `GET` | `/api/v1/system/info` | System info | SystemHealth |

### Security
| Method | Endpoint | Purpose | Used By |
|--------|----------|---------|---------|
| `GET` | `/api/v1/security/status` | Security status and resource limits | Dashboard, Security |
| `GET` | `/api/v1/security/health` | Security health | Security |
| `GET` | `/api/v1/security/incidents` | Security incidents | Security |
| `POST` | `/api/v1/security/incidents/{id}/resolve` | Resolve incident | Security |

### Ollama Integration
| Method | Endpoint | Purpose | Used By |
|--------|----------|---------|---------|
| `GET` | `/api/v1/ollama/models` | Available models | - |
| `GET` | `/api/v1/ollama/models/names` | Model names only | AgentManagement |
| `GET` | `/api/v1/ollama/health` | Ollama health | Dashboard, SystemHealth |
| `POST` | `/api/v1/ollama/models/pull/{name}` | Pull model | - |

### Logging
| Method | Endpoint | Purpose | Used By |
|--------|----------|---------|---------|
| `GET` | `/api/v1/logs/{task_id}` | Task logs | - |
| `GET` | `/api/v1/logs/history` | Historical logs | - |
| `GET` | `/api/v1/logs/stream/{task_id}` | Server-Sent Events stream | Future: LogsViewer |

## Backend Integration Status ✅

The frontend implementation has been updated to fully align with the backend's expanded WebSocket and logging documentation. Key alignments:

- ✅ **WebSocket Authentication**: JWT token implementation matches backend requirements
- ✅ **Message Format**: Frontend parsing matches backend message schema exactly
- ✅ **Connection URLs**: Support for both development (`ws://`) and production (`wss://`) environments
- ✅ **Raw WebSocket Usage**: Correctly uses raw WebSockets (not Socket.IO) as specified
- ✅ **Query Parameters**: Proper implementation of `agent_id`, `task_id`, and `level` filtering
- ✅ **Error Handling**: Comprehensive error handling for connection failures and invalid tokens
- ✅ **Heartbeat Mechanism**: 30-second ping/pong with 90-second timeout implemented
- ✅ **Rate Limiting**: Client-side rate limiting (100 messages/minute) with backend error handling
- ✅ **Connection Limits**: Awareness of 50 per user, 200 global connection limits

## Backend Requirements for Full Functionality

### WebSocket Log Streaming
The real-time logs viewer requires the backend to send log messages via WebSocket with the following message format:

```json
{
  "type": "log_entry",
  "data": {
    "timestamp": "2024-01-01T12:00:00Z",
    "level": "info|warning|error|debug",
    "message": "Log message content",
    "agent_id": "optional-agent-uuid",
    "task_id": "optional-task-uuid",
    "source": "pipeline|agent|system"
  }
}
```

### Required Backend Information ✅
Based on the updated backend documentation, the following specifications are confirmed:

1. ✅ **Log Message Schema**: Complete specification provided (see message format above)
2. ✅ **Agent ID Format**: UUID format for agent identification
3. ✅ **Task ID Format**: UUID format for task identification
4. ✅ **Log Levels**: `debug`, `info`, `warning`, `error`
5. ✅ **WebSocket Heartbeat**: 30-second ping/pong mechanism implemented
6. ✅ **Connection Limits**: 50 per user, 200 global maximum concurrent connections
7. ✅ **Rate Limiting**: 100 messages per minute per WebSocket connection

### Backend Log Sources ✅
Based on backend documentation, the following log sources are supported:

- **Agent execution**: Logs from running agents (`source: "agent"`)
- **Task processing**: Task-specific execution logs (`source: "pipeline"`)
- **System events**: Backend system-level logs (`source: "system"`)
- **Security events**: Security-related log entries (integrated with security monitoring)

## Future Enhancements

### Implemented WebSocket Integration ✅
1. ✅ **Real-time Logs Streaming**: Full implementation with channel management and filtering
2. ✅ **Multi-channel Log Viewer**: Agent-specific and task-specific log streams
3. ✅ **Live Log Filtering**: Real-time filtering by agent, task, and log level
4. ✅ **WebSocket Authentication**: JWT token integration for secure connections

### Future WebSocket Enhancements
1. **Real-time Dashboard Updates**: Connect to `/ws/logs` for live metrics in dashboard
2. **Task Progress Monitoring**: Use `/ws/tasks/{id}` for task execution feedback
3. **Security Incident Alerts**: Real-time security notifications
4. **System Metrics Streaming**: Live system metrics via WebSocket

### Potential API Additions
1. **Bulk Operations**: Batch agent/task operations
2. **Advanced Filtering**: More sophisticated query parameters
3. **WebSocket Authentication**: Token refresh for long-running connections

## Maintenance Notes

### When Backend API Changes:
1. Update `ApiClient` methods in `frontend/src/services/api.ts`
2. Update component queries that use affected endpoints
3. Test error handling for new response formats
4. Update this documentation

### When Adding New Features:
1. Add new API methods to `ApiClient`
2. Create/update React Query hooks in components
3. Add error handling and loading states
4. Document in this file

### WebSocket Usage:
1. Always include JWT token in connection
2. Handle reconnection logic
3. Clean up subscriptions on component unmount
4. Parse messages safely with error handling

### Debugging Features Added:
1. **GPU Processing Logs**: Console logs for each GPU being processed from API response
2. **GPU Rendering Logs**: Console logs for each GPU being rendered in React components
3. **Unique React Keys**: Improved keys for proper component re-rendering: `gpu-${gpu.id}-${_index}`
4. **Error Boundary Ready**: Components prepared for error boundary implementation

### Recent Fixes Applied:
1. **Scroll Bar Visibility**: Fixed CSS conflicts preventing scroll bars from appearing
2. **GPU Display**: Fixed syntax error and added debugging for multi-GPU display
3. **Documentation Updates**: Updated both backend and frontend documentation to reflect changes

This document should be updated whenever new API calls or WebSocket connections are added to maintain it as the source of truth for frontend-backend integration.