'use client';

import Button from '@mui/material/Button';
import { useTranslations } from 'next-intl';
import { useMainContext } from '@/components/MainContext';
import { useFileReader } from '@/hooks/useFileReader.ts';


export default function FileInput() {
  const { activeHandles } = useMainContext();
  const t = useTranslations('FileInput');

  const {
    canUseFilePicker,
    onFileInputChange,
    requestInputHandle,
  } = useFileReader();

  const { busy } = useMainContext();

  return (
    <div>
      {canUseFilePicker ? (
        <Button
          onClick={requestInputHandle}
          disabled={busy}
        >
          {t('watchFiles', { activeHandles })}
        </Button>
      ) : (
        <Button
          component="label"
          disabled={busy}
        >
          {t('openFiles')}
          <input
            type="file"
            multiple
            hidden
            disabled={busy}
            onChange={onFileInputChange}
          />
        </Button>
      )}
    </div>
  );
}
