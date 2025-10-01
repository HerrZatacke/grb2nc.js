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
          className="file-input__button"
          onClick={requestInputHandle}
        >
          Open File(s)
        </button>
      ) : (
        <label
          className="file-input__button"
        >
          Open File(s)
          <input
            className="file-input__input"
            type="file"
            multiple
            onChange={onFileInputChange}
          />
        </label>
      )}
    </div>
  );
}
