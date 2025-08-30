import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Badge,
  Switch,
  FormControlLabel,
  Grid,
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  Clear,
  FilterList,
  BugReport,
  Info,
  Warning,
  Error,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import webSocketService from '../services/websocket';
import apiClient from '../services/api';
import type { LogEntry } from '../types';

interface LogFilters {
  agent_id?: string;
  task_id?: string;
  level?: string;
}

interface LogChannel {
  id: string;
  name: string;
  filters: LogFilters;
  active: boolean;
  logs: LogEntry[];
  color: string;
  connectionType: 'websocket' | 'sse';
}

const LOG_LEVELS = ['debug', 'info', 'warning', 'error'];
const LOG_COLORS = {
  debug: '#9e9e9e',
  info: '#2196f3',
  warning: '#ff9800',
  error: '#f44336',
};

const LogsViewer: React.FC = () => {
  const [channels, setChannels] = useState<LogChannel[]>([
    {
      id: 'all',
      name: 'All Logs',
      filters: {},
      active: true,
      logs: [],
      color: '#1976d2',
      connectionType: 'websocket',
    },
  ]);

  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [autoScroll, setAutoScroll] = useState(true);
  const [maxLogs, setMaxLogs] = useState(1000);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Fetch available agents for filtering
  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: () => apiClient.getAgents(),
    refetchInterval: 30000,
  });

  // Fetch available tasks for filtering
  const { data: tasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => apiClient.getTasks(),
    refetchInterval: 30000,
  });

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [channels, autoScroll]);

  // Handle incoming log messages
  const handleLogMessage = useCallback((logEntry: LogEntry) => {
    setChannels(prevChannels =>
      prevChannels.map(channel => {
        // Check if log matches channel filters
        const matchesFilters = Object.entries(channel.filters).every(([key, value]) => {
          if (!value) return true;
          return logEntry[key as keyof LogEntry] === value;
        });

        if (matchesFilters || channel.id === 'all') {
          const newLogs = [...channel.logs, logEntry];
          // Keep only the most recent logs
          if (newLogs.length > maxLogs) {
            newLogs.splice(0, newLogs.length - maxLogs);
          }
          return { ...channel, logs: newLogs };
        }
        return channel;
      })
    );
  }, [maxLogs]);

  // Start/stop log streaming
  const toggleLogStreaming = useCallback(() => {
    const activeChannel = channels.find(c => c.id === selectedChannel);
    if (!activeChannel) return;

    if (unsubscribeRef.current) {
      // Stop streaming
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    } else {
      // Start streaming
      unsubscribeRef.current = webSocketService.subscribeToLogs(
        handleLogMessage,
        activeChannel.filters
      );
    }
  }, [channels, selectedChannel, handleLogMessage]);

  // Add new channel
  const addChannel = useCallback(() => {
    const newChannel: LogChannel = {
      id: `channel-${Date.now()}`,
      name: `Channel ${channels.length}`,
      filters: {},
      active: false,
      logs: [],
      color: '#1976d2',
      connectionType: 'websocket',
    };
    setChannels(prev => [...prev, newChannel]);
  }, [channels.length]);

  // Update channel filters
  const updateChannelFilters = useCallback((channelId: string, filters: LogFilters) => {
    setChannels(prev =>
      prev.map(channel =>
        channel.id === channelId
          ? { ...channel, filters }
          : channel
      )
    );
  }, []);

  // Clear logs for a channel
  const clearChannelLogs = useCallback((channelId: string) => {
    setChannels(prev =>
      prev.map(channel =>
        channel.id === channelId
          ? { ...channel, logs: [] }
          : channel
      )
    );
  }, []);

  // Delete channel
  const deleteChannel = useCallback((channelId: string) => {
    if (channelId === 'all') return; // Can't delete the 'all' channel

    setChannels(prev => {
      const newChannels = prev.filter(c => c.id !== channelId);
      if (selectedChannel === channelId) {
        setSelectedChannel('all');
      }
      return newChannels;
    });
  }, [selectedChannel]);

  // Get log level icon
  const getLogLevelIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
        return <Error color="error" fontSize="small" />;
      case 'warning':
        return <Warning color="warning" fontSize="small" />;
      case 'info':
        return <Info color="info" fontSize="small" />;
      case 'debug':
        return <BugReport color="disabled" fontSize="small" />;
      default:
        return <Info color="action" fontSize="small" />;
    }
  };

  const selectedChannelData = channels.find(c => c.id === selectedChannel);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            Real-Time Logs Viewer
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor live logs from running agents and tasks
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                size="small"
              />
            }
            label="Auto-scroll"
          />

          <Button
            variant={unsubscribeRef.current ? "outlined" : "contained"}
            color={unsubscribeRef.current ? "error" : "primary"}
            startIcon={unsubscribeRef.current ? <Stop /> : <PlayArrow />}
            onClick={toggleLogStreaming}
            disabled={!selectedChannelData?.active && selectedChannel !== 'all'}
          >
            {unsubscribeRef.current ? 'Stop Streaming' : 'Start Streaming'}
          </Button>
        </Box>
      </Box>

      {/* Channel Management */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card elevation={0}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Log Channels
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={addChannel}
                  startIcon={<FilterList />}
                >
                  Add Channel
                </Button>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {channels.map(channel => (
                  <Chip
                    key={channel.id}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Badge
                          badgeContent={channel.logs.length}
                          color="primary"
                          max={999}
                        >
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: channel.color,
                            }}
                          />
                        </Badge>
                        {channel.name}
                      </Box>
                    }
                    onClick={() => setSelectedChannel(channel.id)}
                    color={selectedChannel === channel.id ? 'primary' : 'default'}
                    variant={selectedChannel === channel.id ? 'filled' : 'outlined'}
                    onDelete={channel.id !== 'all' ? () => deleteChannel(channel.id) : undefined}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={0}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Channel Filters
              </Typography>

              {selectedChannelData && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControl size="small" fullWidth>
                    <InputLabel>Agent</InputLabel>
                    <Select
                      value={selectedChannelData.filters.agent_id || ''}
                      label="Agent"
                      onChange={(e) => updateChannelFilters(selectedChannel, {
                        ...selectedChannelData.filters,
                        agent_id: e.target.value || undefined
                      })}
                    >
                      <MenuItem value="">All Agents</MenuItem>
                      {agents?.map(agent => (
                        <MenuItem key={agent.id} value={agent.id}>
                          {agent.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size="small" fullWidth>
                    <InputLabel>Task</InputLabel>
                    <Select
                      value={selectedChannelData.filters.task_id || ''}
                      label="Task"
                      onChange={(e) => updateChannelFilters(selectedChannel, {
                        ...selectedChannelData.filters,
                        task_id: e.target.value || undefined
                      })}
                    >
                      <MenuItem value="">All Tasks</MenuItem>
                      {tasks?.map(task => (
                        <MenuItem key={task.id} value={task.id}>
                          {task.id}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size="small" fullWidth>
                    <InputLabel>Log Level</InputLabel>
                    <Select
                      value={selectedChannelData.filters.level || ''}
                      label="Log Level"
                      onChange={(e) => updateChannelFilters(selectedChannel, {
                        ...selectedChannelData.filters,
                        level: e.target.value || undefined
                      })}
                    >
                      <MenuItem value="">All Levels</MenuItem>
                      {LOG_LEVELS.map(level => (
                        <MenuItem key={level} value={level}>
                          {level.toUpperCase()}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Logs Display */}
      <Card elevation={0}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {selectedChannelData?.name} ({selectedChannelData?.logs.length} logs)
            </Typography>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                type="number"
                label="Max Logs"
                value={maxLogs}
                onChange={(e) => setMaxLogs(parseInt(e.target.value) || 100)}
                sx={{ width: 100 }}
              />
              <Button
                variant="outlined"
                size="small"
                startIcon={<Clear />}
                onClick={() => clearChannelLogs(selectedChannel)}
              >
                Clear
              </Button>
            </Box>
          </Box>

          <Paper
            elevation={0}
            sx={{
              height: 500,
              overflow: 'auto',
              backgroundColor: 'grey.50',
              p: 2,
              fontFamily: 'monospace',
              fontSize: '0.875rem',
            }}
          >
            {selectedChannelData?.logs.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  {unsubscribeRef.current ? 'Waiting for logs...' : 'No logs to display. Start streaming to see live logs.'}
                </Typography>
              </Box>
            ) : (
              selectedChannelData && (
                <List dense>
                  {selectedChannelData.logs.map((log, index) => (
                    <React.Fragment key={`${log.timestamp}-${index}`}>
                      <ListItem sx={{ px: 0, py: 0.5 }}>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {getLogLevelIcon(log.level)}
                              <Typography
                                variant="body2"
                                sx={{
                                  fontFamily: 'monospace',
                                  fontSize: '0.8rem',
                                  color: LOG_COLORS[log.level as keyof typeof LOG_COLORS] || '#000',
                                  flex: 1,
                                }}
                              >
                                [{new Date(log.timestamp).toLocaleTimeString()}] {log.message}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                              {log.agent_id && (
                                <Chip
                                  label={`Agent: ${log.agent_id}`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.7rem' }}
                                />
                              )}
                              {log.task_id && (
                                <Chip
                                  label={`Task: ${log.task_id}`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.7rem' }}
                                />
                              )}
                              <Chip
                                label={log.level.toUpperCase()}
                                size="small"
                                color={log.level === 'error' ? 'error' : log.level === 'warning' ? 'warning' : 'default'}
                                sx={{ fontSize: '0.7rem' }}
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < selectedChannelData.logs.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                  <div ref={logsEndRef} />
                </List>
              )
            )}
          </Paper>
        </CardContent>
      </Card>

      {/* Connection Status */}
      {unsubscribeRef.current && (
        <Alert severity="success" sx={{ mt: 2 }}>
          <Typography variant="body2">
            Connected to live log stream for channel "{selectedChannelData?.name}"
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default LogsViewer;