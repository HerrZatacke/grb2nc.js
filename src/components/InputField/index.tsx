import './styles.scss';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useTranslations } from 'next-intl';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { useMainContext } from '@/components/MainContext';

export interface Props {
  label: string;
  fieldName: string;
  value: string;
  precision: number;
  unitTranslationKey: string;
  min?: number;
  max?: number;
  step?: number;
  onChange: (newValue: string) => void;
}


export function InputField({ value, fieldName, onChange, label, precision, unitTranslationKey, step, min, max }: Props) {
  const t = useTranslations('InputField');
  const { globalUnits, busy } = useMainContext();
  const [intermediateValue, setIntermediateValue] = useState<string>(value);

  const clampMin = typeof min === 'number' ? min : -Infinity;
  const clampMax = typeof max === 'number' ? max : Infinity;

  const changeHandler = useCallback((ev: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setIntermediateValue(ev.target.value || '');
  }, []);

  const clampValue = useCallback((unclampedValue: number) => {
    return Math.min(clampMax, Math.max(clampMin, unclampedValue));
  }, [clampMax, clampMin]);

  const cleanValue = useCallback((dirtyValue: string): string => {
    const numericValue = parseFloat(dirtyValue);
    if (!isNaN(numericValue)) {
      return clampValue(numericValue).toFixed(precision);
    } else {
      return '';
    }
  }, [clampValue, precision]);

  const incDec = useCallback((inc: boolean) => {
    const incStep = step || 10 ** (1 - precision);
    const numericValue = parseFloat(intermediateValue);
    const direction = inc ? 1 : -1;
    const newValue = clampValue(numericValue + (direction * incStep)).toFixed(precision);
    setIntermediateValue(newValue);
    onChange(newValue);
  }, [clampValue, intermediateValue, onChange, precision, step]);

  const blurHandler = useCallback((ev: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    <Stack
      direction="row"
      gap={2}
    >
      <TextField
        fullWidth
        autoComplete="off"
        disabled={busy}
        id={`field-${fieldName}`}
        value={intermediateValue}
        onChange={changeHandler}
        onBlur={blurHandler}
        label={label}
        size="small"
        variant="outlined"
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                {t(`units.${unitTranslationKey}`, { globalUnits })}
              </InputAdornment>
            ),
          },
          htmlInput: {
            sx: { textAlign: 'right' },
          },
        }}
      />
      <ButtonGroup>
        <Button
          disabled={busy || parseFloat(value) >= clampMax}
          onClick={() => incDec(true)}
          title={t('buttonLabelIncrease', { value: clampMax.toString(10) })}
        >
          <AddIcon />
        </Button>
        <Button
          disabled={busy || parseFloat(value) <= clampMin}
          onClick={() => incDec(false)}
          title={t('buttonLabelDecrease', { value: clampMin.toString(10) })}
        >
          <RemoveIcon />
        </Button>
      </ButtonGroup>
    </Stack>
  );
}
