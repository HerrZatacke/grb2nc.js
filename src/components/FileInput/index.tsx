'use client';

import Button from '@mui/material/Button';
import { useTranslations } from 'next-intl';
import { useMainContext } from '@/components/MainContext';
import { useFileReader } from '@/hooks/useFileReader.ts';


export default function FileInput() {
  const { activeHandles, globalSettings: { useSimpleFileInput } } = useMainContext();
  const t = useTranslations('FileInput');

  const {
    canUseFilePicker,
    onFileInputChange,
    requestInputHandle,
    extensions,
  } = useFileReader();

  const { busy } = useMainContext();

  return (
    <div>
      {canUseFilePicker && !useSimpleFileInput ? (
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
            accept={extensions.join(',')}
          />
        </Button>
      )}
    </div>
  );
}
