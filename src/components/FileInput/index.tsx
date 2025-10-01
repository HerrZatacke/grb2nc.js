'use client';

import {useFileReader} from "@/hooks/useFileReader.ts";
import './styles.scss';


export default function FileInput() {
  const {
    canUseFilePicker,
    onFileInputChange,
    requestInputHandle,
  } = useFileReader();
  return (
    <div className="file-input">
      {canUseFilePicker ? (
        <button
          type="button"
          onClick={requestInputHandle}
        >
          Open File(s)
        </button>
      ) : (
        <input
          className="file-input__input"
          type="file"
          multiple
          onChange={onFileInputChange}
        />
      )}
    </div>
  );
}
