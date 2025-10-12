'use client';

import './styles.scss';
import LinearProgress from '@mui/material/LinearProgress';
import { useMainContext } from '@/components/MainContext';

export default function Progress() {
  const { progress } = useMainContext();
  if (!progress) { return null; }

  return (
    <LinearProgress
      variant="determinate"
      value={progress * 100}
    />
  );
}
