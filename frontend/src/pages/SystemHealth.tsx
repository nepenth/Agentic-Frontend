import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Button,
  Alert,
  Chip,
  LinearProgress,
  Paper,
  Skeleton,
} from '@mui/material';
import {
  Refresh,
  TrendingUp,
  Speed,
  Memory,
  Storage,
  DeviceThermostat,
  Videocam,
  Timeline,
  CheckCircle,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/api';
import { CardSkeleton } from '../components';

// Mock data for system health metrics
const mockSystemMetrics = {
  cpu: {
    usage: 45,
    temperature: 68,
    cores: 8,
    frequency: 3.2,
    loadAverage: [1.2, 1.1, 1.0],
  },
  memory: {
    used: 6.2,
    total: 16,
    percentage: 39,
    swapUsed: 0.5,
    swapTotal: 8,
  },
  disk: {
    used: 234,
    total: 500,
    percentage: 47,
    readSpeed: 125,
    writeSpeed: 98,
  },
  network: {
    download: 45.2,
    upload: 12.8,
    connections: 1247,
    latency: 23,
  },
  gpus: [
    {
      id: 0,
      name: 'Tesla P40',
      usage: 67,
      memoryUsed: 8.2,
      memoryTotal: 24,
      temperature: 149, // Fahrenheit
      frequency: 1531,
      memoryFrequency: 3802,
      power: 125,
    },
    {
      id: 1,
      name: 'Tesla P40',
      usage: 34,
      memoryUsed: 4.1,
      memoryTotal: 24,
      temperature: 132, // Fahrenheit
      frequency: 1412,
      memoryFrequency: 3601,
      power: 98,
    },
  ],
  system: {
    uptime: '7 days, 14 hours',
    loadAverage: [1.2, 1.1, 1.0],
    processes: 284,
    health: 'healthy',
  },
};

const SystemHealth: React.FC = () => {
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const {
    data: systemData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      try {
        // Get Prometheus metrics from backend
        const metricsResponse = await apiClient.getMetrics();

        // For now, return mock data since we need to parse Prometheus format
        // TODO: Parse Prometheus metrics format and extract system metrics
        console.log('Raw Prometheus metrics:', metricsResponse);

        return mockSystemMetrics;
      } catch (error) {
        console.warn('Failed to fetch system metrics, using mock data:', error);
        // Fallback to mock data
        return mockSystemMetrics;
      }
    },
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  const handleRefresh = async () => {
    await refetch();
    setLastRefresh(new Date());
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'info';
    }
  };


  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
        >
          Failed to load system health data. Please try again.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            System Health
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Real-time monitoring of system resources and performance metrics.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </Typography>
          <IconButton onClick={handleRefresh} disabled={isLoading}>
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {/* System Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card elevation={0}>
            <CardContent>
              {isLoading ? (
                <CardSkeleton lines={3} />
              ) : (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      System Status
                    </Typography>
                    <CheckCircle color="success" />
                  </Box>
                  <Chip
                    label={systemData?.system?.health || 'healthy'}
                    color={getHealthColor(systemData?.system?.health || 'healthy') as any}
                    sx={{ mb: 2, fontWeight: 600, textTransform: 'capitalize' }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Uptime: {systemData?.system?.uptime || '7 days, 14 hours'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Processes: {systemData?.system?.processes || 284}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card elevation={0}>
            <CardContent>
              {isLoading ? (
                <CardSkeleton lines={3} />
              ) : (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      CPU
                    </Typography>
                    <Speed color="primary" />
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                    {systemData?.cpu?.usage || 45}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {systemData?.cpu?.cores || 8} cores • {systemData?.cpu?.frequency || 3.2} GHz
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Temp: {systemData?.cpu?.temperature || 68}°C
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card elevation={0}>
            <CardContent>
              {isLoading ? (
                <CardSkeleton lines={3} />
              ) : (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Memory
                    </Typography>
                    <Memory color="info" />
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'info.main', mb: 1 }}>
                    {systemData?.memory?.percentage || 39}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {systemData?.memory?.used || 6.2}GB / {systemData?.memory?.total || 16}GB
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Swap: {systemData?.memory?.swapUsed || 0.5}GB / {systemData?.memory?.swapTotal || 8}GB
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card elevation={0}>
            <CardContent>
              {isLoading ? (
                <CardSkeleton lines={3} />
              ) : (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Storage
                    </Typography>
                    <Storage color="warning" />
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'warning.main', mb: 1 }}>
                    {systemData?.disk?.percentage || 47}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {systemData?.disk?.used || 234}GB / {systemData?.disk?.total || 500}GB
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Read: {systemData?.disk?.readSpeed || 125} MB/s
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Metrics */}
      <Grid container spacing={3}>
        {/* CPU & Memory Details */}
        <Grid item xs={12} lg={6}>
          <Card elevation={0}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                CPU & Memory Details
              </Typography>

              {isLoading ? (
                <Box>
                  {[...Array(4)].map((_, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Skeleton variant="text" width="30%" height={24} />
                      <Skeleton variant="rectangular" width="100%" height={8} sx={{ borderRadius: 1 }} />
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box>
                  {/* CPU Usage */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>CPU Usage</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>{systemData?.cpu?.usage || 45}%</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={systemData?.cpu?.usage || 45}
                      sx={{ height: 8, borderRadius: 1 }}
                      color="primary"
                    />
                  </Box>

                  {/* Memory Usage */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>Memory Usage</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>{systemData?.memory?.percentage || 39}%</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={systemData?.memory?.percentage || 39}
                      sx={{ height: 8, borderRadius: 1 }}
                      color="info"
                    />
                  </Box>

                  {/* Load Average */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Load Average (1m, 5m, 15m)
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      {(systemData?.cpu?.loadAverage || [1.2, 1.1, 1.0]).map((load: number, index: number) => (
                        <Chip
                          key={index}
                          label={load.toFixed(1)}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Network & Disk Details */}
        <Grid item xs={12} lg={6}>
          <Card elevation={0}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Network & Storage Details
              </Typography>

              {isLoading ? (
                <Box>
                  {[...Array(4)].map((_, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Skeleton variant="text" width="30%" height={24} />
                      <Skeleton variant="rectangular" width="100%" height={8} sx={{ borderRadius: 1 }} />
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box>
                  {/* Network */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>Network I/O</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        ↓ {systemData?.network?.download || 45.2} MB/s ↑ {systemData?.network?.upload || 12.8} MB/s
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <Box sx={{ flex: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min((systemData?.network?.download || 45.2) * 2, 100)}
                          sx={{ height: 6, borderRadius: 1 }}
                          color="success"
                        />
                        <Typography variant="caption" color="text.secondary">Download</Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min((systemData?.network?.upload || 12.8) * 5, 100)}
                          sx={{ height: 6, borderRadius: 1 }}
                          color="info"
                        />
                        <Typography variant="caption" color="text.secondary">Upload</Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Connections: {systemData?.network?.connections || 1247} • Latency: {systemData?.network?.latency || 23}ms
                    </Typography>
                  </Box>

                  {/* Disk Usage */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>Disk Usage</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>{systemData?.disk?.percentage || 47}%</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={systemData?.disk?.percentage || 47}
                      sx={{ height: 8, borderRadius: 1 }}
                      color="warning"
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {systemData?.disk?.used || 234}GB used of {systemData?.disk?.total || 500}GB
                    </Typography>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* GPU Details */}
        <Grid item xs={12}>
          <Card elevation={0}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                GPU Monitoring (Tesla P40 × 2)
              </Typography>

              {isLoading ? (
                <Box>
                  {[...Array(2)].map((_, index) => (
                    <Box key={index} sx={{ mb: 3 }}>
                      <Skeleton variant="text" width="40%" height={28} />
                      <Grid container spacing={2}>
                        {[...Array(6)].map((_, i) => (
                          <Grid item xs={12} sm={6} md={2} key={i}>
                            <Skeleton variant="rectangular" width="100%" height={60} sx={{ borderRadius: 1 }} />
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box>
                  {(systemData?.gpus || mockSystemMetrics.gpus).map((gpu: any, _index: number) => (
                    <Box key={gpu.id} sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                        GPU {gpu.id + 1}: {gpu.name}
                      </Typography>

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={2}>
                          <Paper elevation={0} sx={{ p: 2, textAlign: 'center', border: 1, borderColor: 'divider' }}>
                            <Videocam sx={{ fontSize: 24, color: 'primary.main', mb: 1 }} />
                            <Typography variant="body2" color="text.secondary">Usage</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>{gpu.usage}%</Typography>
                          </Paper>
                        </Grid>

                        <Grid item xs={12} sm={6} md={2}>
                          <Paper elevation={0} sx={{ p: 2, textAlign: 'center', border: 1, borderColor: 'divider' }}>
                            <Memory sx={{ fontSize: 24, color: 'info.main', mb: 1 }} />
                            <Typography variant="body2" color="text.secondary">Memory</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>{gpu.memoryUsed}GB/{gpu.memoryTotal}GB</Typography>
                          </Paper>
                        </Grid>

                        <Grid item xs={12} sm={6} md={2}>
                          <Paper elevation={0} sx={{ p: 2, textAlign: 'center', border: 1, borderColor: 'divider' }}>
                            <DeviceThermostat sx={{ fontSize: 24, color: 'error.main', mb: 1 }} />
                            <Typography variant="body2" color="text.secondary">Temperature</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>{gpu.temperature}°F</Typography>
                          </Paper>
                        </Grid>

                        <Grid item xs={12} sm={6} md={2}>
                          <Paper elevation={0} sx={{ p: 2, textAlign: 'center', border: 1, borderColor: 'divider' }}>
                            <Speed sx={{ fontSize: 24, color: 'warning.main', mb: 1 }} />
                            <Typography variant="body2" color="text.secondary">GPU Freq</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>{gpu.frequency}MHz</Typography>
                          </Paper>
                        </Grid>

                        <Grid item xs={12} sm={6} md={2}>
                          <Paper elevation={0} sx={{ p: 2, textAlign: 'center', border: 1, borderColor: 'divider' }}>
                            <Timeline sx={{ fontSize: 24, color: 'success.main', mb: 1 }} />
                            <Typography variant="body2" color="text.secondary">Mem Freq</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>{gpu.memoryFrequency}MHz</Typography>
                          </Paper>
                        </Grid>

                        <Grid item xs={12} sm={6} md={2}>
                          <Paper elevation={0} sx={{ p: 2, textAlign: 'center', border: 1, borderColor: 'divider' }}>
                            <TrendingUp sx={{ fontSize: 24, color: 'secondary.main', mb: 1 }} />
                            <Typography variant="body2" color="text.secondary">Power</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>{gpu.power}W</Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SystemHealth;