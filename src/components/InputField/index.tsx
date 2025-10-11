import './styles.scss';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';

export interface Props {
  label: string;
  fieldName: string;
  value: string;
  precision: number;
  unit: string;
  step?: number;
  onChange: (newValue: string) => void;
}

export function InputField({ value, fieldName, onChange, label, precision, unit, step }: Props) {
  const [intermediateValue, setIntermediateValue] = useState<string>(value);
  const changeHandler = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
    setIntermediateValue(ev.target.value || '');
  }, []);

  const cleanValue = useCallback((dirtyValue: string): string => {
    const numericValue = parseFloat(dirtyValue);
    if (!isNaN(numericValue)) {
      return numericValue.toFixed(precision);
    } else {
      return '';
    }
  }, [precision]);

  const incDec = useCallback((inc: boolean) => {
    const incStep = step || 10 ** (1 - precision);
    const numericValue = parseFloat(intermediateValue);
    const direction = inc ? 1 : -1;
    const newValue = (numericValue + (direction * incStep)).toFixed(precision);
    setIntermediateValue(newValue);
    onChange(newValue);
  }, [intermediateValue, onChange, precision, step]);

  const blurHandler = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
    if (ev.target.value) {
      const cleaned = cleanValue(ev.target.value);
      setIntermediateValue(cleaned);
      onChange(cleaned);
    }
  }, [cleanValue, onChange]);

  useEffect(() => {
    setIntermediateValue(cleanValue(value));
  }, [cleanValue, value]);

  return (
    <div className="input-field">
      <label
        htmlFor={`field-${fieldName}`}
        className="input-field__label"
      >
        {label}
      </label>
      <div
        className="input-field__input-wrapper"
      >
        <input
          className="input-field__input"
          id={`field-${fieldName}`}
          value={intermediateValue}
          onChange={changeHandler}
          onBlur={blurHandler}
        />
        <span className="input-field__units">{unit}</span>
      </div>
      <button className="input-field__button" onClick={() => incDec(true)}>➕</button>
      <button className="input-field__button" onClick={() => incDec(false)}>➖</button>
    </div>
  );
}
