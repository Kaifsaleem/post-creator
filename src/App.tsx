import { useState, useEffect } from 'react';
import { 
  Box, Container, CssBaseline, AppBar, Toolbar, Typography, Paper, Grid, 
  TextField, Button, Card, CardContent, CardActions, IconButton, Snackbar, 
  Alert, CircularProgress, Divider, ThemeProvider, createTheme, 
  Switch, FormControlLabel, Dialog, DialogTitle, DialogContent, 
  DialogActions, Avatar, useMediaQuery, InputAdornment
} from '@mui/material';
import { 
  Delete as DeleteIcon, Link as LinkIcon, Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon, Person as PersonIcon, LockOutlined as LockIcon,
  ContentCopy as CopyIcon, Favorite as FavoriteIcon
} from '@mui/icons-material';
import axios from 'axios';
import './App.css';

interface Link {
  _id: string;
  title: string;
  url: string;
  description: string;
  postedBy: string;
  createdAt: string;
}

// Define static user data
const USERS = [
  { username: 'kaif', password: 'kaif@123' },
  { username: 'shoaib', password: 'shoaib@123' },
  { username: 'abuzar', password: 'abuzar@123' },
  { username: 'mohammad', password: 'mohammad@123' },
  { username: 'huzefa', password: 'huzefa@123' }
];

function App() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(localStorage.getItem('darkMode') === 'true');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(localStorage.getItem('isAuthenticated') === 'true');
  const [currentUser, setCurrentUser] = useState<string>(localStorage.getItem('currentUser') || '');
  const [loginOpen, setLoginOpen] = useState<boolean>(!isAuthenticated);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    postedBy: currentUser
  });

  // Create theme based on dark mode preference
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: darkMode ? '#7986cb' : '#3f51b5', // Indigo
      },
      secondary: {
        main: darkMode ? '#ff80ab' : '#f50057', // Pink
      },
      background: {
        default: darkMode ? '#121212' : '#f8f9fa',
        paper: darkMode ? '#1e1e1e' : '#ffffff',
      },
      error: {
        main: '#f44336',
      },
      warning: {
        main: '#ff9800',
      },
      info: {
        main: '#2196f3',
      },
      success: {
        main: '#4caf50',
      },
    },
    typography: {
      fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
            fontWeight: 600,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            overflow: 'hidden',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchLinks();
    }
    
    // Update postedBy with current user
    setFormData((prev) => ({ ...prev, postedBy: currentUser }));
  }, [isAuthenticated, currentUser]);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/links');
      setLinks(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch links. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.title || !formData.url) {
        setError('Please fill in all required fields');
        return;
      }

      // Basic URL validation
      let finalUrl = formData.url;
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = `https://${finalUrl}`;
      }

      await axios.post('http://localhost:5000/api/links', {
        ...formData,
        url: finalUrl,
        postedBy: currentUser // Always use the current user
      });
      
      setNotification('Link added successfully!');
      
      // Reset form
      setFormData({
        title: '',
        url: '',
        description: '',
        postedBy: currentUser
      });
      
      // Refresh links
      fetchLinks();
    } catch (err) {
      setError('Failed to add link. Please try again.');
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/links/${id}`);
      setNotification('Link deleted successfully!');
      fetchLinks();
    } catch (err) {
      setError('Failed to delete link. Please try again.');
      console.error(err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    const user = USERS.find(
      u => u.username.toLowerCase() === loginForm.username.toLowerCase() && 
           u.password === loginForm.password
    );
    
    if (user) {
      setIsAuthenticated(true);
      setCurrentUser(user.username);
      setLoginOpen(false);
      setNotification(`Welcome back, ${user.username}!`);
      
      // Store in localStorage
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('currentUser', user.username);
      
      // Update postedBy with the authenticated user
      setFormData(prev => ({
        ...prev,
        postedBy: user.username
      }));
    } else {
      setError('Invalid username or password. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser('');
    setLoginOpen(true);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUser');
    setNotification('You have been logged out');
  };

  const handleCloseNotification = () => {
    setNotification(null);
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar 
        position="static" 
        color="primary" 
        elevation={0}
        sx={{
          background: darkMode 
            ? 'linear-gradient(90deg, #303f9f 0%, #7986cb 100%)' 
            : 'linear-gradient(90deg, #3f51b5 0%, #5c6bc0 100%)',
          borderBottom: darkMode ? '1px solid rgba(255,255,255,0.08)' : 'none'
        }}
      >
        <Toolbar>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              p: 1,
              mr: 2
            }}
          >
            <LinkIcon />
          </Box>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              fontWeight: 'bold',
              letterSpacing: '0.5px'
            }}
          >
            Link Sharing Dashboard
          </Typography>
          
          {/* Dark Mode Toggle */}
          <FormControlLabel
            control={
              <Switch 
                checked={darkMode}
                onChange={handleToggleDarkMode}
                icon={<LightModeIcon />}
                checkedIcon={<DarkModeIcon />}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#fff',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    opacity: 0.7,
                  },
                }}
              />
            }
            label={darkMode ? "Dark" : "Light"}
          />
          
          {/* User Authentication */}
          {isAuthenticated ? (
            <Button 
              color="inherit" 
              onClick={handleLogout}
              startIcon={<PersonIcon />}
              sx={{ 
                ml: 2,
                backgroundColor: 'rgba(255,255,255,0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.2)',
                }
              }}
            >
              Logout ({currentUser})
            </Button>
          ) : (
            <Button 
              color="inherit"
              onClick={() => setLoginOpen(true)}
              startIcon={<PersonIcon />}
              sx={{ 
                ml: 2,
                backgroundColor: 'rgba(255,255,255,0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.2)',
                }
              }}
            >
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {isAuthenticated ? (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
          <Grid container spacing={3}>
            {/* Link Submission Form */}
            <Grid item xs={12}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 3, 
                  borderRadius: 3,
                  border: darkMode ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '5px',
                    width: '100%',
                    background: 'linear-gradient(90deg, #3f51b5, #7986cb)',
                  }}
                />
                
                <Typography 
                  variant="h5" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    mt: 1
                  }}
                >
                  <Box 
                    sx={{
                      mr: 1.5,
                      display: 'flex',
                      p: 1,
                      borderRadius: '50%',
                      backgroundColor: darkMode ? 'rgba(63, 81, 181, 0.1)' : 'rgba(63, 81, 181, 0.05)',
                    }}
                  >
                    <LinkIcon color="primary" />
                  </Box>
                  Share a New Link
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={2.5}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        label="Title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        variant="outlined"
                        placeholder="Enter a descriptive title"
                        InputProps={{
                          sx: { borderRadius: 2 }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        label="URL"
                        name="url"
                        value={formData.url}
                        onChange={handleInputChange}
                        variant="outlined"
                        placeholder="https://example.com"
                        InputProps={{
                          sx: { borderRadius: 2 }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Description (Optional)"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        variant="outlined"
                        multiline
                        rows={2}
                        placeholder="Add a short description about this link..."
                        InputProps={{
                          sx: { borderRadius: 2 }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Box display="flex" justifyContent="flex-end">
                        <Button 
                          type="submit" 
                          variant="contained" 
                          color="primary" 
                          size="large"
                          sx={{ 
                            borderRadius: 2, 
                            px: 4, 
                            fontWeight: 600,
                            py: 1.2,
                            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)'
                          }}
                        >
                          Submit Link
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </form>
              </Paper>
            </Grid>

            {/* Links Display */}
            <Grid item xs={12}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 3, 
                  borderRadius: 3,
                  border: darkMode ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '5px',
                    width: '100%',
                    background: 'linear-gradient(90deg, #3f51b5, #7986cb)',
                  }}
                />
                
                <Typography 
                  variant="h5" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    mt: 1
                  }}
                >
                  <Box 
                    sx={{
                      mr: 1.5,
                      display: 'flex',
                      p: 1,
                      borderRadius: '50%',
                      backgroundColor: darkMode ? 'rgba(63, 81, 181, 0.1)' : 'rgba(63, 81, 181, 0.05)',
                    }}
                  >
                    <FavoriteIcon color="secondary" />
                  </Box>
                  Shared Links
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                {loading ? (
                  <Box display="flex" justifyContent="center" p={3}>
                    <CircularProgress />
                  </Box>
                ) : links.length === 0 ? (
                  <Typography align="center" color="textSecondary" sx={{ py: 5 }}>
                    No links shared yet. Be the first to share!
                  </Typography>
                ) : (
                  <Grid container spacing={2}>
                    {links.map((link) => (
                      <Grid item xs={12} sm={6} md={4} key={link._id}>
                        <Card elevation={3} sx={{ 
                          height: '100%', 
                          display: 'flex', 
                          flexDirection: 'column',
                          transition: 'all 0.3s ease',
                          borderRadius: 3,
                          overflow: 'hidden',
                          border: darkMode ? '1px solid rgba(255,255,255,0.05)' : 'none',
                          '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: darkMode 
                              ? '0 12px 20px rgba(0,0,0,0.4)' 
                              : '0 12px 20px rgba(0,0,0,0.15)'
                          }
                        }}>
                          <Box 
                            sx={{
                              height: '8px',
                              background: 'linear-gradient(90deg, #3f51b5, #7986cb)',
                              width: '100%'
                            }}
                          />
                          <CardContent sx={{ flexGrow: 1, p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Typography variant="h6" gutterBottom sx={{ 
                                fontWeight: 'bold',
                                mb: 0.5
                              }}>
                                {link.title}
                              </Typography>
                            </Box>
                            <Box 
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                mb: 2,
                                color: 'text.secondary',
                                fontSize: '0.875rem'
                              }}
                            >
                              <Box 
                                component="span" 
                                sx={{ 
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  mr: 2
                                }}
                              >
                                <PersonIcon sx={{ fontSize: '0.875rem', mr: 0.5 }} />
                                {link.postedBy}
                              </Box>
                              <Box component="span">
                                {new Date(link.createdAt).toLocaleDateString()}
                              </Box>
                            </Box>
                            {link.description && (
                              <Typography 
                                variant="body2" 
                                paragraph 
                                sx={{ 
                                  color: 'text.secondary',
                                  mb: 2,
                                  lineHeight: 1.6
                                }}
                              >
                                {link.description}
                              </Typography>
                            )}
                            <Button 
                              variant="outlined" 
                              startIcon={<LinkIcon />}
                              href={link.url}
                              target="_blank"
                              size="small"
                              sx={{ 
                                textTransform: 'none',
                                borderRadius: 2,
                                borderWidth: '1.5px',
                                fontWeight: 600,
                                '&:hover': {
                                  borderWidth: '1.5px',
                                  backgroundColor: darkMode ? 'rgba(63, 81, 181, 0.1)' : 'rgba(63, 81, 181, 0.05)',
                                }
                              }}
                            >
                              Visit Link
                            </Button>
                          </CardContent>
                          <CardActions sx={{ 
                            justifyContent: 'space-between', 
                            p: 2,
                            pt: 0,
                            borderTop: '1px solid',
                            borderColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                            mt: 1
                          }}>
                            <Box>
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => {
                                  navigator.clipboard.writeText(link.url);
                                  setNotification('Link copied to clipboard!');
                                }}
                                aria-label="copy link"
                                sx={{ 
                                  mr: 1,
                                  backgroundColor: darkMode ? 'rgba(63, 81, 181, 0.1)' : 'rgba(63, 81, 181, 0.05)',
                                }}
                              >
                                <CopyIcon fontSize="small" />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                color="secondary"
                                aria-label="like"
                                sx={{ 
                                  backgroundColor: darkMode ? 'rgba(245, 0, 87, 0.1)' : 'rgba(245, 0, 87, 0.05)',
                                }}
                              >
                                <FavoriteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                            
                            {link.postedBy === currentUser && (
                              <IconButton 
                                size="small" 
                                color="error" 
                                onClick={() => handleDelete(link._id)}
                                aria-label="delete"
                                sx={{ 
                                  backgroundColor: darkMode ? 'rgba(244, 67, 54, 0.1)' : 'rgba(244, 67, 54, 0.05)',
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            )}
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Container>
      ) : (
        <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom>
              Please log in to access the dashboard
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              This dashboard is only available to authorized users.
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => setLoginOpen(true)}
              sx={{ mt: 2, borderRadius: 2 }}
            >
              Log In
            </Button>
          </Paper>
        </Container>
      )}      {/* Login Dialog */}
      <Dialog 
        open={loginOpen} 
        onClose={() => !isAuthenticated && setLoginOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          elevation: 24,
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
            position: 'relative'
          }
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '5px',
            width: '100%',
            background: 'linear-gradient(90deg, #3f51b5, #7986cb)',
          }}
        />
        <DialogTitle sx={{ pb: 1, pt: 3 }}>
          <Box 
            display="flex" 
            alignItems="center" 
            justifyContent="center" 
            flexDirection="column"
            sx={{ mb: 2 }}
          >
            <Avatar 
              sx={{ 
                bgcolor: 'primary.main', 
                width: 60, 
                height: 60,
                mb: 2,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
            >
              <LockIcon fontSize="large" />
            </Avatar>
            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
              Login to Dashboard
            </Typography>
          </Box>
        </DialogTitle>
        <form onSubmit={handleLogin}>
          <DialogContent sx={{ px: 3 }}>
            <Typography variant="body2" color="textSecondary" paragraph align="center" sx={{ mb: 3 }}>
              Enter your credentials to access the link sharing dashboard.
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              name="username"
              label="Username"
              type="text"
              fullWidth
              variant="outlined"
              value={loginForm.username}
              onChange={handleLoginInputChange}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 }
              }}
              sx={{ mb: 2.5 }}
            />
            <TextField
              margin="dense"
              name="password"
              label="Password"
              type="password"
              fullWidth
              variant="outlined"
              value={loginForm.password}
              onChange={handleLoginInputChange}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 }
              }}
              sx={{ mb: 1 }}
            />
            <Typography 
              variant="caption" 
              color="textSecondary" 
              sx={{ 
                mt: 1.5, 
                display: 'block',
                bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                p: 1.5,
                borderRadius: 2,
                border: '1px solid',
                borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
              }}
            >
              <strong>Available Users:</strong> kaif, shoaib, abuzar, mohammad, huzefa
              <br />
              <strong>Password format:</strong> username@123 (e.g., kaif@123)
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, pt: 1, justifyContent: 'center' }}>
            <Button 
              type="submit" 
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              sx={{ 
                borderRadius: 2,
                p: 1.25,
                fontWeight: 600,
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)'
              }}
            >
              Login
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Notifications */}
      <Snackbar 
        open={!!notification} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity="success" sx={{ width: '100%' }}>
          {notification}
        </Alert>
      </Snackbar>

      {/* Error Messages */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App
