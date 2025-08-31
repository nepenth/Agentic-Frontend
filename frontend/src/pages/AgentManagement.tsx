import React, { useState, useRef, useEffect } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
  Tooltip,
  Switch,
  FormControlLabel,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  PlayArrow,
  Refresh,
  SmartToy,
  CheckCircle,
  Error,
  Settings,
  AutoAwesome,
  Send,
  Person,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import type { Agent, OllamaModelNamesResponse, ChatSession, ChatMessage } from '../types';

interface CreateAgentForm {
  name: string;
  description: string;
  model_name: string;
  temperature: number;
  max_tokens: number;
  system_prompt: string;
}

const AgentManagement: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [wizardDialogOpen, setWizardDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [wizardSession, setWizardSession] = useState<ChatSession | null>(null);
  const [wizardMessages, setWizardMessages] = useState<ChatMessage[]>([]);
  const [wizardInput, setWizardInput] = useState('');
  const [isWizardTyping, setIsWizardTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<CreateAgentForm>({
    name: '',
    description: '',
    model_name: 'qwen3:30b-a3b-thinking-2507-q8_0',
    temperature: 0.7,
    max_tokens: 1000,
    system_prompt: 'You are a helpful AI assistant.',
  });

  // Fetch agents with enhanced filtering
  const {
    data: agents,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['agents', formData], // Include filters in query key
    queryFn: () => apiClient.getAgents(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch available Ollama models
  const {
    data: availableModels,
    isLoading: modelsLoading,
  } = useQuery<OllamaModelNamesResponse>({
    queryKey: ['ollama-models'],
    queryFn: () => apiClient.getOllamaModelNames(),
    refetchInterval: 60000, // Refetch every minute
  });

  // Create agent mutation
  const createAgentMutation = useMutation({
    mutationFn: (agentData: Partial<Agent>) => apiClient.createAgent(agentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      setCreateDialogOpen(false);
      resetForm();
    },
  });

  // Update agent mutation
  const updateAgentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Agent> }) =>
      apiClient.updateAgent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      setEditingAgent(null);
      resetForm();
    },
  });

  // Delete agent mutation
  const deleteAgentMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteAgent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });

  // Wizard mutations
  const createWizardSessionMutation = useMutation({
    mutationFn: (description: string) =>
      apiClient.createChatSession({
        session_type: 'agent_creation',
        model_name: formData.model_name,
        title: `Agent Creation: ${description.slice(0, 50)}...`,
        user_id: 'current-user',
        config: { description },
      }),
    onSuccess: (session) => {
      setWizardSession(session);
      setWizardMessages([]);
    },
  });

  const sendWizardMessageMutation = useMutation({
    mutationFn: ({ sessionId, message }: { sessionId: string; message: string }) =>
      apiClient.sendChatMessage(sessionId, { message }),
    onSuccess: (response) => {
      if (response.message && response.response) {
        setWizardMessages(prev => [...prev, response.message, {
          id: `assistant-${Date.now()}`,
          session_id: response.session_id,
          role: 'assistant',
          content: response.response || 'I received your message.',
          timestamp: new Date().toISOString(),
        }]);
      }
      setWizardInput('');
      setIsWizardTyping(false);
    },
    onError: () => {
      setIsWizardTyping(false);
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      model_name: 'qwen3:30b-a3b-thinking-2507-q8_0',
      temperature: 0.7,
      max_tokens: 1000,
      system_prompt: 'You are a helpful AI assistant.',
    });
  };

  const handleCreateAgent = () => {
    createAgentMutation.mutate(formData);
  };

  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent);
    setFormData({
      name: agent.name,
      description: agent.description,
      model_name: agent.model_name,
      temperature: agent.config.temperature,
      max_tokens: agent.config.max_tokens,
      system_prompt: agent.config.system_prompt,
    });
  };

  const handleUpdateAgent = () => {
    if (editingAgent) {
      updateAgentMutation.mutate({
        id: editingAgent.id,
        data: formData,
      });
    }
  };

  const handleDeleteAgent = (id: string) => {
    if (window.confirm('Are you sure you want to delete this agent?')) {
      deleteAgentMutation.mutate(id);
    }
  };

  const handleToggleAgent = (agent: Agent) => {
    updateAgentMutation.mutate({
      id: agent.id,
      data: { is_active: !agent.is_active },
    });
  };

  const handleRunTask = (agentId: string) => {
    // Navigate to a task creation page or open a dialog
    navigate(`/workflows?agent=${agentId}`);
  };

  const handleStartWizard = () => {
    if (!formData.description.trim()) return;
    setIsWizardTyping(true);
    createWizardSessionMutation.mutate(formData.description);
    setWizardDialogOpen(true);
  };

  const handleSendWizardMessage = () => {
    if (!wizardInput.trim() || !wizardSession) return;
    setIsWizardTyping(true);

    // Add user message to the chat
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      session_id: wizardSession.id,
      role: 'user',
      content: wizardInput,
      timestamp: new Date().toISOString(),
    };

    setWizardMessages(prev => [...prev, userMessage]);
    sendWizardMessageMutation.mutate({
      sessionId: wizardSession.id,
      message: wizardInput,
    });
  };

  const handleCloseWizard = () => {
    setWizardDialogOpen(false);
    setWizardSession(null);
    setWizardMessages([]);
    setWizardInput('');
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [wizardMessages]);

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? (
      <CheckCircle color="success" />
    ) : (
      <Error color="disabled" />
    );
  };


  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          Failed to load agents. Please try again.
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
            Agent Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create, configure, and manage your AI agents dynamically.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => refetch()}
            disabled={isLoading}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<AutoAwesome />}
            onClick={() => setWizardDialogOpen(true)}
          >
            AI Wizard
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Manual Create
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Total Agents
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {isLoading ? '...' : agents?.length || 0}
                  </Typography>
                </Box>
                <SmartToy sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Active Agents
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'success.main' }}>
                    {isLoading ? '...' : agents?.filter(a => a.is_active).length || 0}
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Models Used
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'info.main' }}>
                    {isLoading ? '...' : new Set(agents?.map(a => a.model_name)).size || 0}
                  </Typography>
                </Box>
                <Settings sx={{ fontSize: 40, color: 'info.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Recently Created
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'warning.main' }}>
                    {isLoading ? '...' : agents?.filter(a => {
                      const created = new Date(a.created_at);
                      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                      return created > weekAgo;
                    }).length || 0}
                  </Typography>
                </Box>
                <Add sx={{ fontSize: 40, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Agents Table */}
      <Card elevation={0}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Agent List
          </Typography>

          {isLoading ? (
            <Box>
              {[...Array(5)].map((_, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Skeleton variant="rectangular" width="100%" height={60} sx={{ borderRadius: 1 }} />
                </Box>
              ))}
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Status</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Model</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {agents?.map((agent) => (
                    <TableRow key={agent.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getStatusIcon(agent.is_active)}
                          <FormControlLabel
                            control={
                              <Switch
                                checked={agent.is_active}
                                onChange={() => handleToggleAgent(agent)}
                                size="small"
                              />
                            }
                            label=""
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {agent.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={agent.model_name}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.75rem' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary" sx={{
                          maxWidth: 200,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {agent.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(agent.created_at).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Run Task">
                            <IconButton
                              size="small"
                              onClick={() => handleRunTask(agent.id)}
                              disabled={!agent.is_active}
                            >
                              <PlayArrow />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Agent">
                            <IconButton
                              size="small"
                              onClick={() => handleEditAgent(agent)}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Agent">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteAgent(agent.id)}
                              color="error"
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )) || (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No agents found. Create your first agent to get started.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Create Agent Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Agent</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Agent Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Model</InputLabel>
                <Select
                  value={formData.model_name}
                  label="Model"
                  onChange={(e) => setFormData({ ...formData, model_name: e.target.value })}
                  disabled={modelsLoading}
                >
                  {modelsLoading ? (
                    <MenuItem disabled>Loading models...</MenuItem>
                  ) : (
                    availableModels?.models?.map((model) => (
                      <MenuItem key={model} value={model}>
                        {model}
                      </MenuItem>
                    )) || (
                      <MenuItem value="qwen3:30b-a3b-thinking-2507-q8_0">
                        Qwen 3 30B (Thinking) - Default
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={2}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Temperature"
                type="number"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                inputProps={{ min: 0, max: 2, step: 0.1 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Max Tokens"
                type="number"
                value={formData.max_tokens}
                onChange={(e) => setFormData({ ...formData, max_tokens: parseInt(e.target.value) })}
                inputProps={{ min: 1, max: 4096 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="System Prompt"
                value={formData.system_prompt}
                onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                multiline
                rows={3}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateAgent}
            variant="contained"
            disabled={createAgentMutation.isPending || !formData.name || !formData.description}
          >
            {createAgentMutation.isPending ? 'Creating...' : 'Create Agent'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Agent Dialog */}
      <Dialog
        open={!!editingAgent}
        onClose={() => setEditingAgent(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Agent</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Agent Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Model</InputLabel>
                <Select
                  value={formData.model_name}
                  label="Model"
                  onChange={(e) => setFormData({ ...formData, model_name: e.target.value })}
                  disabled={modelsLoading}
                >
                  {modelsLoading ? (
                    <MenuItem disabled>Loading models...</MenuItem>
                  ) : (
                    availableModels?.models?.map((model) => (
                      <MenuItem key={model} value={model}>
                        {model}
                      </MenuItem>
                    )) || (
                      <MenuItem value="qwen3:30b-a3b-thinking-2507-q8_0">
                        Qwen 3 30B (Thinking) - Default
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={2}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Temperature"
                type="number"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                inputProps={{ min: 0, max: 2, step: 0.1 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Max Tokens"
                type="number"
                value={formData.max_tokens}
                onChange={(e) => setFormData({ ...formData, max_tokens: parseInt(e.target.value) })}
                inputProps={{ min: 1, max: 4096 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="System Prompt"
                value={formData.system_prompt}
                onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                multiline
                rows={3}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingAgent(null)}>Cancel</Button>
          <Button
            onClick={handleUpdateAgent}
            variant="contained"
            disabled={updateAgentMutation.isPending || !formData.name || !formData.description}
          >
            {updateAgentMutation.isPending ? 'Updating...' : 'Update Agent'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* AI-Assisted Agent Creation Wizard Dialog */}
      <Dialog
        open={wizardDialogOpen}
        onClose={handleCloseWizard}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { height: '80vh', maxHeight: '800px' },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AutoAwesome sx={{ color: 'primary.main' }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                🤖 AI Agent Creation Wizard
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Describe your agent and let AI help you create it
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <Divider />

        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {!wizardSession ? (
            /* Initial Description Input */
            <Box sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Box sx={{ maxWidth: 600, mx: 'auto', textAlign: 'center' }}>
                <SmartToy sx={{ fontSize: 64, color: 'primary.main', mb: 3 }} />
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                  Describe Your Agent
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  Tell the AI assistant what kind of agent you want to create. Be as specific as possible about its purpose, capabilities, and requirements.
                </Typography>

                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., Create an agent that analyzes emails from my Gmail account, categorizes them by importance, and extracts key information like sender, subject, and urgency level."
                  sx={{ mb: 3 }}
                />

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>AI Model</InputLabel>
                  <Select
                    value={formData.model_name}
                    label="AI Model"
                    onChange={(e) => setFormData({ ...formData, model_name: e.target.value })}
                  >
                    {availableModels?.models?.map((model) => (
                      <MenuItem key={model} value={model}>
                        {model}
                      </MenuItem>
                    )) || (
                      <MenuItem value="qwen3:30b-a3b-thinking-2507-q8_0">
                        Qwen 3 30B (Thinking) - Default
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>

                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AutoAwesome />}
                  onClick={handleStartWizard}
                  disabled={!formData.description.trim() || createWizardSessionMutation.isPending}
                  sx={{ minWidth: 200 }}
                >
                  {createWizardSessionMutation.isPending ? 'Starting Wizard...' : 'Start AI Creation'}
                </Button>
              </Box>
            </Box>
          ) : (
            /* Chat Interface */
            <>
              <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                {wizardMessages.map((message) => (
                  <Box
                    key={message.id}
                    sx={{
                      display: 'flex',
                      mb: 2,
                      justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        maxWidth: '70%',
                        alignItems: 'flex-start',
                        gap: 1,
                      }}
                    >
                      {message.role === 'assistant' && (
                        <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                          <SmartToy fontSize="small" />
                        </Avatar>
                      )}
                      <Paper
                        elevation={1}
                        sx={{
                          p: 2,
                          bgcolor: message.role === 'user' ? 'primary.main' : 'background.paper',
                          color: message.role === 'user' ? 'white' : 'text.primary',
                          borderRadius: 2,
                        }}
                      >
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                          {message.content}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            mt: 1,
                            color: message.role === 'user' ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                          }}
                        >
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Typography>
                      </Paper>
                      {message.role === 'user' && (
                        <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                          <Person fontSize="small" />
                        </Avatar>
                      )}
                    </Box>
                  </Box>
                ))}

                {isWizardTyping && (
                  <Box sx={{ display: 'flex', mb: 2, alignItems: 'flex-start', gap: 1 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                      <SmartToy fontSize="small" />
                    </Avatar>
                    <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        AI is thinking...
                      </Typography>
                    </Paper>
                  </Box>
                )}

                <div ref={messagesEndRef} />
              </Box>

              <Divider />
              <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    value={wizardInput}
                    onChange={(e) => setWizardInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendWizardMessage();
                      }
                    }}
                    placeholder="Ask questions or provide additional requirements..."
                    disabled={sendWizardMessageMutation.isPending}
                  />
                  <Button
                    variant="contained"
                    onClick={handleSendWizardMessage}
                    disabled={!wizardInput.trim() || sendWizardMessageMutation.isPending}
                    sx={{ minWidth: 60 }}
                  >
                    <Send />
                  </Button>
                </Box>
              </Box>
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button onClick={handleCloseWizard} variant="outlined">
            Close
          </Button>
          {wizardSession && (
            <Button
              variant="contained"
              startIcon={<CheckCircle />}
              onClick={() => {
                // Here you could add logic to finalize the agent creation
                // For now, just close the wizard
                handleCloseWizard();
              }}
            >
              Finalize Agent
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AgentManagement;