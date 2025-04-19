import { Card } from '@mui/material';
import { useState, useEffect } from 'react';

type props = {
  noteId: string;
  front: string;
  back: string;
};

export default function NoteShowPortal({ noteId, front, back }: props) {
  return (
    <Card
      variant="outlined"
      sx={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '50%',
        height: '50%',
        backgroundColor: 'white',
        zIndex: 1000,
      }}
    >
      <div>{noteId}</div>
      <div>{front}</div>
      <div>{back}</div>
    </Card>
  );
}
