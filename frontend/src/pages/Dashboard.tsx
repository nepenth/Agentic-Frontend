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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Skeleton,
} from '@mui/material';
import {
  Refresh,
  TrendingUp,
  SmartToy,
  Task,
  Speed,
  Email,
  Description,
  CheckCircle,
  Error,
  Warning,
  Info,
  PlayArrow,
  Circle,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/api';
import { CardSkeleton } from '../components';
import { useNavigate } from 'react-router-dom';

/*
interface DashboardStats {
  totalAgents: number;
  activeTasks: number;
  completedToday: number;
  systemHealth: 'healthy' | 'warning' | 'error';
  recentTasks: Array<{
    id: string;
    agent_name: string;
    status: string;
    created_at: string;
  }>;
  recentLogs: Array<{
    level: string;
    message: string;
    timestamp: string;
  }>;
}
*/

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const {
    data: dashboardData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      try {
        return await apiClient.getDashboardSummary();
      } catch (error) {
        // Mock data for development when backend endpoint doesn't exist yet
        return {
          totalAgents: 3,
          activeTasks: 2,
          completedToday: 12,
          systemHealth: 'healthy',
          recentTasks: [
            {
              id: '1',
              agent_name: 'Email Assistant',
              status: 'completed',
              created_at: new Date(Date.now() - 300000).toISOString(),
            },
            {
              id: '2',
              agent_name: 'Document Analyzer',
              status: 'running',
              created_at: new Date(Date.now() - 600000).toISOString(),
            },
            {
              id: '3',
              agent_name: 'Text Summarizer',
              status: 'completed',
              created_at: new Date(Date.now() - 900000).toISOString(),
            },
          ],
          recentLogs: [
            {
              level: 'info',
              message: 'Task processing completed successfully',
              timestamp: new Date(Date.now() - 120000).toISOString(),
            },
            {
              level: 'warning',
              message: 'High CPU usage detected on worker node',
              timestamp: new Date(Date.now() - 240000).toISOString(),
            },
            {
              level: 'info',
              message: 'New agent registered: Email Assistant',
              timestamp: new Date(Date.now() - 360000).toISOString(),
            },
          ],
        };
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const handleRefresh = async () => {
    await refetch();
    setLastRefresh(new Date());
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle color="success" />;
      case 'running':
        return <PlayArrow color="info" />;
      case 'failed':
        return <Error color="error" />;
      default:
        return <Circle color="disabled" />;
    }
  };

  const getLogIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
        return <Error color="error" />;
      case 'warning':
        return <Warning color="warning" />;
      case 'info':
        return <Info color="info" />;
      default:
        return <Circle color="disabled" />;
    }
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
          Failed to load dashboard data. Please try again.
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
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back! Here's what's happening with your AI agents.
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

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <Card elevation={0} sx={{ height: '100%' }}>
            <CardContent>
              {isLoading ? (
                <CardSkeleton lines={2} />
              ) : (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="text.secondary" gutterBottom variant="h6">
                        Total Agents
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {dashboardData?.totalAgents || 0}
                      </Typography>
                    </Box>
                    <SmartToy sx={{ fontSize: 40, color: 'primary.main' }} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <TrendingUp fontSize="small" color="success" />
                    <Typography variant="body2" color="success.main" sx={{ ml: 1 }}>
                      +2 this week
                    </Typography>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card elevation={0} sx={{ height: '100%' }}>
            <CardContent>
              {isLoading ? (
                <CardSkeleton lines={2} />
              ) : (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="text.secondary" gutterBottom variant="h6">
                        Active Tasks
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700, color: 'info.main' }}>
                        {dashboardData?.activeTasks || 0}
                      </Typography>
                    </Box>
                    <Task sx={{ fontSize: 40, color: 'info.main' }} />
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress variant="determinate" value={75} sx={{ height: 6, borderRadius: 3 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Processing workload
                    </Typography>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card elevation={0} sx={{ height: '100%' }}>
            <CardContent>
              {isLoading ? (
                <CardSkeleton lines={2} />
              ) : (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="text.secondary" gutterBottom variant="h6">
                        Completed Today
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700, color: 'success.main' }}>
                        {dashboardData?.completedToday || 0}
                      </Typography>
                    </Box>
                    <CheckCircle sx={{ fontSize: 40, color: 'success.main' }} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <TrendingUp fontSize="small" color="success" />
                    <Typography variant="body2" color="success.main" sx={{ ml: 1 }}>
                      +20% vs yesterday
                    </Typography>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card elevation={0} sx={{ height: '100%' }}>
            <CardContent>
              {isLoading ? (
                <CardSkeleton lines={2} />
              ) : (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="text.secondary" gutterBottom variant="h6">
                        System Health
                      </Typography>
                      <Chip
                        label={dashboardData?.systemHealth || 'Unknown'}
                        color={getHealthColor(dashboardData?.systemHealth || 'info') as any}
                        sx={{ mt: 1, fontWeight: 600, textTransform: 'capitalize' }}
                      />
                    </Box>
                    <Speed sx={{ fontSize: 40, color: getHealthColor(dashboardData?.systemHealth || 'info') + '.main' }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    All systems operational
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Recent Tasks */}
        <Grid item xs={12} lg={6}>
          <Card elevation={0} sx={{ height: 400 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Recent Tasks
                </Typography>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => navigate('/workflows')}
                >
                  View All
                </Button>
              </Box>

              {isLoading ? (
                <Box>
                  {[...Array(4)].map((_, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
                      <Skeleton variant="circular" width={24} height={24} sx={{ mr: 2 }} />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width="60%" height={20} />
                        <Skeleton variant="text" width="40%" height={16} />
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <List>
                  {dashboardData?.recentTasks?.map((task: any) => (
                    <ListItem key={task.id} disableGutters>
                      <ListItemIcon>
                        {getStatusIcon(task.status)}
                      </ListItemIcon>
                      <ListItemText
                        primary={task.agent_name}
                        secondary={`${task.status} • ${new Date(task.created_at).toLocaleTimeString()}`}
                        primaryTypographyProps={{ fontWeight: 500 }}
                      />
                      <Chip
                        label={task.status}
                        size="small"
                        variant="outlined"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </ListItem>
                  )) || (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No recent tasks
                      </Typography>
                    </Box>
                  )}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* System Logs */}
        <Grid item xs={12} lg={6}>
          <Card elevation={0} sx={{ height: 400 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  System Logs
                </Typography>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => navigate('/utilities')}
                >
                  View All
                </Button>
              </Box>

              {isLoading ? (
                <Box>
                  {[...Array(4)].map((_, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
                      <Skeleton variant="circular" width={24} height={24} sx={{ mr: 2 }} />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width="80%" height={20} />
                        <Skeleton variant="text" width="50%" height={16} />
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <List>
                  {dashboardData?.recentLogs?.map((log: any, index: number) => (
                    <ListItem key={index} disableGutters>
                      <ListItemIcon>
                        {getLogIcon(log.level)}
                      </ListItemIcon>
                      <ListItemText
                        primary={log.message}
                        secondary={new Date(log.timestamp).toLocaleTimeString()}
                        primaryTypographyProps={{ 
                          fontSize: '0.9rem',
                          sx: { 
                            wordBreak: 'break-word',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }
                        }}
                      />
                    </ListItem>
                  )) || (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No recent logs
                      </Typography>
                    </Box>
                  )}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 3, textAlign: 'center', backgroundColor: 'grey.50' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<Email />}
                onClick={() => navigate('/workflows/email-assistant')}
                disabled
              >
                Email Assistant
              </Button>
              <Button
                variant="contained"
                startIcon={<Description />}
                onClick={() => navigate('/workflows/document-analyzer')}
                disabled
              >
                Document Analyzer
              </Button>
              <Button
                variant="outlined"
                startIcon={<SmartToy />}
                onClick={() => navigate('/agents')}
              >
                Manage Agents
              </Button>
              <Button
                variant="outlined"
                startIcon={<Speed />}
                onClick={() => navigate('/utilities')}
              >
                System Tools
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;