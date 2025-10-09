'use client';

import { useMainContext } from '@/components/MainContext';
import './styles.scss';

export default function Error() {
  const { globalErrors } = useMainContext();

  if (!globalErrors.length) { return null; }

  return (
    <>
      { globalErrors.map((errorText, index) => (
        <div
          key={index}
          className="global-error"
        >
          { errorText }
        </div>
      ))}
    </>
  );
}
