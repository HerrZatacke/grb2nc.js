'use client';

import './styles.scss';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
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

  const buttonClass = useMemo<string>(() => (
    clsx('file-input__button', {
      'file-input__button--disabled': busy,
    })
  ), [busy]);

  return (
    <div className="file-input">
      {canUseFilePicker ? (
        <button
          type="button"
          className={buttonClass}
          onClick={requestInputHandle}
          disabled={busy}
        >
          {t('watchFiles', { activeHandles })}
        </button>
      ) : (
        <label className={buttonClass}>
          {t('openFiles')}
          <input
            className="file-input__input"
            type="file"
            multiple
            disabled={busy}
            onChange={onFileInputChange}
          />
        </label>
      )}
    </div>
  );
}
