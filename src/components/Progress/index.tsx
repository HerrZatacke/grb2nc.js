'use client';

import { useMainContext } from '@/components/MainContext';
import './styles.scss';

export default function Progress() {
  const { progress } = useMainContext();
  if (!progress) { return null; }

  return (
    <progress
      className="progress-bar"
      value={progress}
      max={1}
    >
      { progress }
    </progress>
  );
}
