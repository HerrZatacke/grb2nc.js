'use client';

import Alert from '@mui/material/Alert';
import { useMainContext } from '@/components/MainContext';

export default function Error() {
  const { globalErrors } = useMainContext();

  if (!globalErrors.length) { return null; }

  return (
    <>
      { globalErrors.map((errorText, index) => (
        <Alert
          key={index}
          severity="error"
          variant="filled"
        >
          { errorText }
        </Alert>
      ))}
    </>
  );
}
