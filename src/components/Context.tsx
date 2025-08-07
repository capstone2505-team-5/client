import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, Button, useTheme } from '@mui/material';
import { useDocument } from '../contexts/DocumentContext';
import FilePreview from './FilePreview';

const Context = () => {
  const { file, setFile } = useDocument();
  const theme = useTheme();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, [setFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.png', '.jpg'],
      'application/pdf': ['.pdf'],
    }
  });

  const handleRemoveFile = () => {
    setFile(null);
  };

  return (
    <Box>
      {!file ? (
        <Box
          {...getRootProps()}
          sx={{
            border: `2px dashed ${theme.palette.divider}`,
            padding: '20px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: isDragActive ? theme.palette.action.hover : 'transparent',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <input {...getInputProps()} />
          <Typography>
            {isDragActive ? 'Drop file here...' : 'Drag and drop a file or click to upload'}
          </Typography>
        </Box>
      ) : (
        <Box>
          <Button variant="contained" onClick={handleRemoveFile} sx={{ mb: 2 }}>
            Remove File
          </Button>
          <FilePreview file={file} />
        </Box>
      )}
    </Box>
  );
};

export default Context;
