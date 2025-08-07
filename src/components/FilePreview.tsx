import React, { useState, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Box, Typography, Paper, IconButton, Tooltip } from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import PanToolIcon from '@mui/icons-material/PanTool';

// Use local worker file to avoid CORS issues
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

const FilePreview = ({ file }: { file: File }) => {
  const fileType = file.type;
  const [scale, setScale] = useState(1.0);
  const [panMode, setPanMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scrollOffset, setScrollOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3.0));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleResetZoom = () => {
    setScale(1.0);
    setScrollOffset({ x: 0, y: 0 });
    if (containerRef.current) {
      containerRef.current.scrollLeft = 0;
      containerRef.current.scrollTop = 0;
    }
  };

  const handleTogglePan = () => {
    setPanMode(prev => !prev);
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (panMode && containerRef.current) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX + containerRef.current.scrollLeft,
        y: e.clientY + containerRef.current.scrollTop
      });
      e.preventDefault();
    }
  }, [panMode]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && containerRef.current) {
      const deltaX = dragStart.x - e.clientX;
      const deltaY = dragStart.y - e.clientY;
      
      containerRef.current.scrollLeft = deltaX;
      containerRef.current.scrollTop = deltaY;
      e.preventDefault();
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  if (fileType === 'application/pdf') {
    return (
      <Paper elevation={3} sx={{ mt: 2, p: 1, maxHeight: 'calc(100vh - 300px)', overflow: 'hidden' }}>
        {/* Zoom and Pan Controls */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1, gap: 1 }}>
          <Tooltip title="Zoom Out">
            <IconButton onClick={handleZoomOut} disabled={scale <= 0.5}>
              <ZoomOutIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', px: 1 }}>
            {Math.round(scale * 100)}%
          </Typography>
          <Tooltip title="Zoom In">
            <IconButton onClick={handleZoomIn} disabled={scale >= 3.0}>
              <ZoomInIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reset Zoom">
            <IconButton onClick={handleResetZoom}>
              <RestartAltIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={panMode ? "Disable Pan Mode" : "Enable Pan Mode"}>
            <IconButton 
              onClick={handleTogglePan}
              color={panMode ? "primary" : "default"}
              sx={{ 
                backgroundColor: panMode ? 'primary.main' : 'transparent',
                color: panMode ? 'primary.contrastText' : 'inherit',
                '&:hover': {
                  backgroundColor: panMode ? 'primary.dark' : 'action.hover'
                }
              }}
            >
              <PanToolIcon />
            </IconButton>
          </Tooltip>
        </Box>
        
        {/* PDF Document Container */}
        <Box
          ref={containerRef}
          sx={{
            height: 'calc(100% - 60px)',
            overflow: 'auto',
            cursor: panMode ? (isDragging ? 'grabbing' : 'grab') : 'default',
            userSelect: panMode ? 'none' : 'auto'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <Document file={file}>
            <Page pageNumber={1} scale={scale} />
          </Document>
        </Box>
      </Paper>
    );
  }

  if (fileType.startsWith('image/')) {
    return (
      <Box mt={2}>
        <img src={URL.createObjectURL(file)} alt="Preview" style={{ maxWidth: '100%', maxHeight: 'calc(100vh - 300px)' }} />
      </Box>
    );
  }

  return (
    <Box mt={2}>
        <Typography variant="body1" color="textSecondary">
            File type not supported for preview: {file.name}
        </Typography>
    </Box>
  );
};

export default FilePreview; 