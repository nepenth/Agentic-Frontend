import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Divider,
  Chip,
} from '@mui/material';
import {
  Email,
  Send,
  Drafts,
  Archive,
  Star,
  PlayArrow,
  Pause,
} from '@mui/icons-material';
import WorkflowTemplate from '../../pages/WorkflowTemplate';

const EmailAssistant: React.FC = () => {
  const mockEmails = [
    {
      id: 1,
      from: 'john@example.com',
      subject: 'Project Update Required',
      priority: 'high',
      timestamp: '2 hours ago',
      isUnread: true,
    },
    {
      id: 2,
      from: 'sarah@company.com',
      subject: 'Meeting Confirmation',
      priority: 'medium',
      timestamp: '4 hours ago',
      isUnread: true,
    },
    {
      id: 3,
      from: 'support@service.com',
      subject: 'Monthly Report Available',
      priority: 'low',
      timestamp: '1 day ago',
      isUnread: false,
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const actions = (
    <>
      <Button
        variant="contained"
        startIcon={<PlayArrow />}
        disabled
      >
        Start Processing
      </Button>
      <Button
        variant="outlined"
        startIcon={<Pause />}
        disabled
      >
        Pause
      </Button>
    </>
  );

  return (
    <WorkflowTemplate
      title="Email Assistant"
      description="AI-powered email management and response generation"
      status="coming-soon"
      icon={<Email />}
      actions={actions}
    >
      <Grid container spacing={3}>
        {/* Email Processing Stats */}
        <Grid item xs={12} md={4}>
          <Card elevation={0}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Processing Stats
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Emails Processed Today
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  0
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Pending Review
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                  3
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Auto-Responses Sent
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                  0
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Email Queue */}
        <Grid item xs={12} md={8}>
          <Card elevation={0}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Email Queue
                </Typography>
                <Button
                  variant="text"
                  size="small"
                  startIcon={<Email />}
                  disabled
                >
                  Refresh
                </Button>
              </Box>

              <List>
                {mockEmails.map((email, index) => (
                  <React.Fragment key={email.id}>
                    <ListItem>
                      <ListItemIcon>
                        {email.isUnread ? (
                          <Email color="primary" />
                        ) : (
                          <Drafts color="action" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography
                              variant="body1"
                              sx={{ 
                                fontWeight: email.isUnread ? 600 : 400,
                                flex: 1,
                              }}
                            >
                              {email.subject}
                            </Typography>
                            <Chip
                              label={email.priority}
                              size="small"
                              color={getPriorityColor(email.priority) as any}
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              From: {email.from}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {email.timestamp}
                            </Typography>
                          </Box>
                        }
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" disabled>
                          <Star />
                        </IconButton>
                        <IconButton size="small" disabled>
                          <Archive />
                        </IconButton>
                        <IconButton size="small" disabled>
                          <Send />
                        </IconButton>
                      </Box>
                    </ListItem>
                    {index < mockEmails.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Configuration Panel */}
        <Grid item xs={12}>
          <Card elevation={0}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Configuration
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      Email Processing
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Configure how emails are processed and categorized
                    </Typography>
                    <Button variant="outlined" size="small" disabled>
                      Configure
                    </Button>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      Response Templates
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Manage automated response templates and rules
                    </Typography>
                    <Button variant="outlined" size="small" disabled>
                      Manage Templates
                    </Button>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      Integrations
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Connect email providers and services
                    </Typography>
                    <Button variant="outlined" size="small" disabled>
                      Setup Integrations
                    </Button>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      Analytics
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      View detailed analytics and performance metrics
                    </Typography>
                    <Button variant="outlined" size="small" disabled>
                      View Analytics
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </WorkflowTemplate>
  );
};

export default EmailAssistant;