import { useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, Button, useTheme } from '@mui/material';
import { useDocument } from '../contexts/DocumentContext';
import FilePreview from './FilePreview';

interface ContextProps {
  onRenderHeaderActions?: () => React.ReactNode;
}

const Context = ({ onRenderHeaderActions }: ContextProps) => {
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

  // Expose the remove button for header rendering
  useEffect(() => {
    if (onRenderHeaderActions && file) {
      // This effect can be used to trigger parent re-render when file state changes
    }
  }, [file, onRenderHeaderActions]);

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
          <FilePreview file={file} />
        </Box>
      )}
    </Box>
  );
};

// Export a hook to get the current file state and remove handler
export const useContextFile = () => {
  const { file, setFile } = useDocument();
  const handleRemoveFile = () => setFile(null);
  return { file, handleRemoveFile };
};

export default Context;
