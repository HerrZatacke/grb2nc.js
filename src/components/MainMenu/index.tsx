'use client';

import CarpenterIcon from '@mui/icons-material/Carpenter';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import RouteIcon from '@mui/icons-material/Route';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import FileInput from '@/components/FileInput';
import { useMainContext } from '@/components/MainContext';
import { TaskType } from '@/types/tasks.ts';

export default function MainMenu() {
  const { setOperationForm, busy } = useMainContext();

  return (
    <ButtonGroup size="large" variant="contained" disabled={busy}>
      <FileInput />
      <Button
        onClick={() => setOperationForm(TaskType.ISOLATION)}
      >
        <RouteIcon />
      </Button>
      <Button
        onClick={() => setOperationForm(TaskType.DRILL)}
      >
        <GpsFixedIcon />
      </Button>
      <Button
        onClick={() => setOperationForm(TaskType.EDGE_CUT)}
      >
        <CarpenterIcon />
      </Button>
    </ButtonGroup>
  );
}
