// components/HierarchyComponent.js
"use client";
// components/HierarchyComponent.js
import { useState } from 'react';
import { Button, TextField, Paper, Typography } from '@mui/material';

const HierarchyComponent = () => {
  const [expanded, setExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  return (
    <div className="fixed bottom-0 left-0">
      {!expanded && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleToggle}
            style={{
              transform: 'rotate(90deg)',
              position: 'relative',
              top: '-60px',
            }}
          >
            Hierarchy {expanded ? '▼' : '►'}
          </Button>
      )}
      {/* Display the project hierarchy when expanded */}
      {expanded && (
        <Paper elevation={3} className="p-4 mt-2 w-80" style={{ marginLeft: '50px' }}>
          <div className="flex justify-between items-center mb-2">
            <Typography variant="h6">Project Hierarchy</Typography>
            <Button color="secondary" onClick={handleToggle}>
              ✖
            </Button>
          </div>
          <TextField
            label="Search..."
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />
          {/* Your project hierarchy structure goes here */}
        </Paper>
      )}
    </div>
  );
};

export default HierarchyComponent;

