'use client';

import { useMainContext } from '@/components/MainContext';
import './styles.scss';

export default function Error() {
  const { globalError } = useMainContext();

  if (!globalError) { return null; }

  return (
    <div className="global-error">
      { globalError }
    </div>
  );
}
