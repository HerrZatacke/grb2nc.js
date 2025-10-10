'use client';

import './styles.scss';
import { useMainContext } from '@/components/MainContext';

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
