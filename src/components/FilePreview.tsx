import React from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Box, Typography, Paper } from '@mui/material';

// Use local worker file to avoid CORS issues
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

const FilePreview = ({ file }: { file: File }) => {
  const fileType = file.type;

  if (fileType === 'application/pdf') {
    return (
      <Paper elevation={3} sx={{ mt: 2, p: 1, maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
        <Document file={file}>
          <Page pageNumber={1} width={400} />
        </Document>
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