import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  Box,
  Container,
  Typography,
  Paper,
  Slider,
  FormControlLabel,
  Switch,
  Button,
  LinearProgress,
  Snackbar,
  Alert,
  Stack,
  TextField,
  useTheme,
  useMediaQuery,
  Collapse,
  Chip
} from '@mui/material'
import {
  Image,
  Palette,
  Tune,
  Download,
  Refresh,
  CheckCircle,
  PhotoCamera
} from '@mui/icons-material'
import axios from 'axios'
import './App.css'

function App() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  const [colorThreshold, setColorThreshold] = useState(135)
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const [invertBW, setInvertBW] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)
  const [processedImage, setProcessedImage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [showSnackbar, setShowSnackbar] = useState(false)
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')
  const [showSettings, setShowSettings] = useState(true)

  const showSnackbarMessage = (message, severity = 'success') => {
    setSnackbarMessage(message)
    setSnackbarSeverity(severity)
    setShowSnackbar(true)
  }

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewImage(e.target.result)
      }
      reader.readAsDataURL(file)
      showSnackbarMessage('Image selected successfully!', 'success')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp']
    },
    multiple: false
  })

  const handleUpload = async () => {
    if (!selectedFile) {
      showSnackbarMessage('Please select an image to upload.', 'error')
      return
    }

    setIsLoading(true)
    const formData = new FormData()
    formData.append('image', selectedFile)
    formData.append('threshold', colorThreshold * 256)
    formData.append('backgroundColor', backgroundColor)
    formData.append('invertBW', invertBW)

    try {
      const response = await axios.post('/api/upload', formData, {
        responseType: 'arraybuffer'
      })
      
      const base64Image = btoa(
        new Uint8Array(response.data)
          .reduce((data, byte) => data + String.fromCharCode(byte), '')
      )
      
      setProcessedImage(`data:image/png;base64,${base64Image}`)
      showSnackbarMessage('Background removed successfully!', 'success')
    } catch (error) {
      showSnackbarMessage('Error processing image. Please try again.', 'error')
      console.error('Upload error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    setPreviewImage(null)
    setProcessedImage(null)
    setColorThreshold(135)
    setBackgroundColor('#ffffff')
    setInvertBW(false)
  }

  const handleDownload = () => {
    if (processedImage) {
      const link = document.createElement('a')
      link.href = processedImage
      link.download = 'processed-image.png'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative'
    }}>
      {/* Mobile-optimized Container */}
      <Container 
        maxWidth="lg" 
        sx={{ 
          py: { xs: 2, md: 4 },
          px: { xs: 1, sm: 2, md: 3 }
        }}
      >
        {/* Minimalist Header */}
        <Box textAlign="center" mb={{ xs: 3, md: 4 }}>
          <Typography 
            variant={isMobile ? "h4" : "h2"} 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 300,
              color: 'white',
              mb: { xs: 1, md: 2 },
              letterSpacing: '0.02em'
            }}
          >
            Background Remover
          </Typography>
          <Typography 
            variant={isMobile ? "body1" : "h6"} 
            sx={{ 
              color: 'rgba(255,255,255,0.8)',
              mb: 2,
              fontWeight: 300
            }}
          >
            Smart image processing for background removal
          </Typography>
        </Box>

        {/* Main Content Area */}
        <Box sx={{ position: 'relative' }}>
          {/* Primary Upload Area */}
          <Paper 
            elevation={0}
            sx={{ 
              borderRadius: { xs: 2, md: 4 },
              overflow: 'hidden',
              backgroundColor: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              mb: 2
            }}
          >
            {/* Image Display */}
            <Box sx={{ p: { xs: 2, md: 4 } }}>
              {!previewImage && !processedImage && (
                <Box
                  {...getRootProps()}
                  sx={{
                    border: '2px dashed',
                    borderColor: isDragActive ? '#667eea' : '#e0e0e0',
                    borderRadius: 3,
                    p: { xs: 4, md: 8 },
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: isDragActive ? 'rgba(102, 126, 234, 0.05)' : 'transparent',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    minHeight: { xs: 250, md: 350 },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    '&:hover': {
                      borderColor: '#667eea',
                      backgroundColor: 'rgba(102, 126, 234, 0.02)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <input {...getInputProps()} />
                  <PhotoCamera 
                    sx={{ 
                      fontSize: { xs: 48, md: 72 }, 
                      color: '#667eea', 
                      mb: 2,
                      opacity: 0.7
                    }} 
                  />
                  <Typography 
                    variant={isMobile ? "h6" : "h5"} 
                    gutterBottom
                    sx={{ fontWeight: 400, color: '#333' }}
                  >
                    {isDragActive ? 'Drop your image here' : 'Drop image or click to browse'}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Supports JPG, PNG, GIF, BMP, WebP
                  </Typography>
                </Box>
              )}

              {/* Loading State */}
              {isLoading && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Box sx={{ position: 'relative', display: 'inline-flex', mb: 3 }}>
                    <LinearProgress 
                      sx={{ 
                        width: 200, 
                        height: 6, 
                        borderRadius: 3,
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#667eea'
                        }
                      }} 
                    />
                  </Box>
                  <Typography variant="body1" color="text.secondary">
                    Processing your image...
                  </Typography>
                </Box>
              )}

              {/* Image Results */}
              {(previewImage || processedImage) && !isLoading && (
                <Box>
                  {previewImage && (
                    <Box sx={{ mb: processedImage ? 3 : 0 }}>
                      <Typography 
                        variant="subtitle1" 
                        gutterBottom 
                        sx={{ 
                          fontWeight: 500, 
                          color: '#333',
                          mb: 2,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <Image sx={{ mr: 1, fontSize: 20 }} />
                        Original
                      </Typography>
                      <Box
                        sx={{
                          position: 'relative',
                          borderRadius: 2,
                          overflow: 'hidden',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                          // Photoshop-style transparency grid
                          backgroundImage: `
                            linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
                            linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
                            linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)
                          `,
                          backgroundSize: '20px 20px',
                          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                          backgroundColor: '#ffffff'
                        }}
                      >
                        <Box
                          component="img"
                          src={previewImage}
                          alt="Original"
                          sx={{ 
                            width: '100%',
                            maxHeight: { xs: 250, md: 400 },
                            objectFit: 'contain',
                            display: 'block'
                          }}
                        />
                      </Box>
                    </Box>
                  )}

                  {processedImage && (
                    <Box>
                      <Typography 
                        variant="subtitle1" 
                        gutterBottom 
                        sx={{ 
                          fontWeight: 500, 
                          color: '#333',
                          mb: 2,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <CheckCircle sx={{ mr: 1, fontSize: 20, color: '#4caf50' }} />
                        Result
                      </Typography>
                      <Box
                        sx={{
                          position: 'relative',
                          borderRadius: 2,
                          overflow: 'hidden',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                          // Photoshop-style transparency grid
                          backgroundImage: `
                            linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
                            linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
                            linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)
                          `,
                          backgroundSize: '20px 20px',
                          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                          backgroundColor: '#ffffff'
                        }}
                      >
                        <Box
                          component="img"
                          src={processedImage}
                          alt="Processed"
                          sx={{ 
                            width: '100%',
                            maxHeight: { xs: 250, md: 400 },
                            objectFit: 'contain',
                            display: 'block'
                          }}
                        />
                      </Box>
                    </Box>
                  )}
                </Box>
              )}
            </Box>

            {/* Action Bar */}
            <Box sx={{ 
              p: { xs: 2, md: 3 }, 
              backgroundColor: 'rgba(102, 126, 234, 0.03)',
              borderTop: '1px solid rgba(0,0,0,0.05)'
            }}>
              <Stack 
                direction={isMobile ? 'column' : 'row'} 
                spacing={2}
                justifyContent="center"
                alignItems="center"
              >
                <Button
                  variant="contained"
                  onClick={handleUpload}
                  disabled={isLoading || !selectedFile}
                  startIcon={<Image />}
                  size="large"
                  sx={{ 
                    backgroundColor: '#667eea',
                    color: 'white',
                    fontWeight: 500,
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    textTransform: 'none',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                    '&:hover': {
                      backgroundColor: '#5a6fd8',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)'
                    },
                    '&:disabled': {
                      backgroundColor: '#e0e0e0',
                      color: '#999'
                    },
                    minWidth: { xs: '100%', md: 'auto' }
                  }}
                >
                  {isLoading ? 'Processing...' : 'Remove Background'}
                </Button>

                {processedImage && (
                  <Button
                    variant="outlined"
                    onClick={handleDownload}
                    startIcon={<Download />}
                    size="large"
                    sx={{ 
                      borderColor: '#667eea',
                      color: '#667eea',
                      fontWeight: 500,
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      textTransform: 'none',
                      '&:hover': {
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        borderColor: '#5a6fd8',
                        transform: 'translateY(-1px)'
                      },
                      minWidth: { xs: '100%', md: 'auto' }
                    }}
                  >
                    Download
                  </Button>
                )}

                {(previewImage || processedImage) && (
                  <Button
                    variant="text"
                    onClick={handleReset}
                    startIcon={<Refresh />}
                    size="large"
                    sx={{ 
                      color: '#666',
                      fontWeight: 500,
                      px: 3,
                      py: 1.5,
                      borderRadius: 3,
                      textTransform: 'none',
                      '&:hover': {
                        backgroundColor: 'rgba(0,0,0,0.05)'
                      },
                      minWidth: { xs: '100%', md: 'auto' }
                    }}
                  >
                    New Image
                  </Button>
                )}
              </Stack>
            </Box>
          </Paper>

          {/* Settings Panel */}
          <Collapse in={showSettings}>
            <Paper 
              elevation={0}
              sx={{ 
                borderRadius: { xs: 2, md: 4 },
                backgroundColor: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
                p: { xs: 2, md: 3 }
              }}
            >
              <Box sx={{ mb: 4 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600, 
                    color: '#333',
                    mb: 1,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <Tune sx={{ mr: 1.5, fontSize: 24, color: '#667eea' }} />
                  Settings
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#777',
                    mb: 3
                  }}
                >
                  Adjust parameters to fine-tune the background removal
                </Typography>
              </Box>
              
              <Stack spacing={4}>
                {/* Background Color */}
                <Box sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  backgroundColor: 'rgba(102, 126, 234, 0.03)',
                  border: '1px solid rgba(102, 126, 234, 0.1)'
                }}>
                  <Typography 
                    sx={{ 
                      fontWeight: 600, 
                      color: '#333',
                      mb: 1,
                      display: 'flex', 
                      alignItems: 'center' 
                    }}
                  >
                    <Palette sx={{ mr: 1.5, fontSize: 20, color: '#667eea' }} />
                    Background Color
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ color: '#666', mb: 2 }}
                  >
                    Choose the color to replace the removed background
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: 2,
                        backgroundColor: backgroundColor,
                        border: '3px solid white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease',
                        '&:hover': {
                          transform: 'scale(1.05)'
                        }
                      }}
                    />
                    <TextField
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      sx={{
                        flex: 1,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'white',
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#667eea'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#667eea'
                          }
                        }
                      }}
                    />
                  </Box>
                </Box>
                
                {/* Color Threshold */}
                <Box sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  backgroundColor: 'rgba(102, 126, 234, 0.03)',
                  border: '1px solid rgba(102, 126, 234, 0.1)'
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography 
                      sx={{ 
                        fontWeight: 600, 
                        color: '#333',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <Box sx={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%', 
                        backgroundColor: '#667eea',
                        mr: 1.5
                      }} />
                      Color Threshold
                    </Typography>
                    <Chip 
                      label={colorThreshold} 
                      size="small" 
                      sx={{ 
                        backgroundColor: '#667eea',
                        color: 'white',
                        fontWeight: 600,
                        minWidth: 45
                      }} 
                    />
                  </Box>
                  <Typography 
                    variant="body2" 
                    sx={{ color: '#666', mb: 2 }}
                  >
                    Higher values remove more background, lower values preserve more detail
                  </Typography>
                  <Slider
                    value={colorThreshold}
                    onChange={(e, value) => setColorThreshold(value)}
                    min={0}
                    max={256}
                    marks={[
                      { value: 0, label: 'Precise' },
                      { value: 128, label: 'Balanced' },
                      { value: 256, label: 'Aggressive' }
                    ]}
                    sx={{
                      color: '#667eea',
                      height: 6,
                      '& .MuiSlider-thumb': {
                        backgroundColor: '#667eea',
                        width: 20,
                        height: 20,
                        '&:hover': {
                          boxShadow: '0 0 0 8px rgba(102, 126, 234, 0.16)'
                        },
                        '&.Mui-focusVisible': {
                          boxShadow: '0 0 0 8px rgba(102, 126, 234, 0.16)'
                        }
                      },
                      '& .MuiSlider-track': {
                        backgroundColor: '#667eea',
                        border: 'none'
                      },
                      '& .MuiSlider-rail': {
                        backgroundColor: 'rgba(102, 126, 234, 0.2)'
                      },
                      '& .MuiSlider-mark': {
                        backgroundColor: 'transparent'
                      },
                      '& .MuiSlider-markLabel': {
                        fontSize: '0.75rem',
                        color: '#666',
                        fontWeight: 500
                      }
                    }}
                  />
                </Box>

                {/* Invert Toggle */}
                <Box sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  backgroundColor: 'rgba(102, 126, 234, 0.03)',
                  border: '1px solid rgba(102, 126, 234, 0.1)'
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        sx={{ 
                          fontWeight: 600, 
                          color: '#333',
                          mb: 1,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <Box sx={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: '50%', 
                          backgroundColor: invertBW ? '#667eea' : '#ccc',
                          mr: 1.5,
                          transition: 'background-color 0.2s ease'
                        }} />
                        Invert Black & White
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ color: '#666', mb: 1 }}
                      >
                        Swap black and white colors in the final result
                      </Typography>
                    </Box>
                    <Switch
                      checked={invertBW}
                      onChange={(e) => setInvertBW(e.target.checked)}
                      sx={{
                        ml: 2,
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#667eea'
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#667eea'
                        },
                        '& .MuiSwitch-track': {
                          backgroundColor: '#e0e0e0'
                        }
                      }}
                    />
                  </Box>
                </Box>
              </Stack>
            </Paper>
          </Collapse>
        </Box>
      </Container>



      {/* Snackbar */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={4000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowSnackbar(false)} 
          severity={snackbarSeverity}
          sx={{ 
            width: '100%',
            borderRadius: 2,
            '&.MuiAlert-standardSuccess': {
              backgroundColor: '#4caf50',
              color: 'white'
            },
            '&.MuiAlert-standardError': {
              backgroundColor: '#f44336',
              color: 'white'
            }
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default App
