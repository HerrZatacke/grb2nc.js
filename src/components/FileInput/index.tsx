'use client';

import clsx from 'clsx';
import { useMemo } from 'react';
import { useMainContext } from '@/components/MainContext';
import { useFileReader } from '@/hooks/useFileReader.ts';
import './styles.scss';


export default function FileInput() {
  const { activeHandles } = useMainContext();

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
          { activeHandles ? `Watching ${activeHandles} File(s)` : 'Watch File(s)'}
        </button>
      ) : (
        <label className={buttonClass}>
          Open File(s)
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
