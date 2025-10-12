'use client';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';
import { InputField } from '@/components/InputField';
import { useMainContext } from '@/components/MainContext';
import { fieldParams } from '@/components/OperationForm/fieldParams.ts';
import { MachiningParams } from '@/types/machining.ts';
import { TaskType } from '@/types/tasks.ts';

export default function OperationForm() {
  const {
    operationForm,
    machiningOperations,
    updateMachiningOperationParams,
    setOperationForm,
  } = useMainContext();
  const t = useTranslations('OperationForm');
  const [editedValues, setEditedValues] = useState<Partial<MachiningParams>>({});

  const editValues: MachiningParams | null = useMemo(() => {
    const operationValues = operationForm && machiningOperations?.[operationForm] || null;
    if (!operationValues) { return null; }

    return ({
      ...operationValues,
      ...editedValues,
    });
  }, [editedValues, machiningOperations, operationForm]);

  const changeHandler = useCallback((fieldName: keyof MachiningParams) => (value: string) => {
    setEditedValues((current) => ({
      ...current,
      [fieldName]: value,
    }));
  }, []);

  const abort = useCallback(() => {
    setOperationForm(null);
    setEditedValues({});
  }, [setOperationForm]);

  const save = useCallback(() => {
    if (!operationForm) { return; }
    setOperationForm(null);
    updateMachiningOperationParams(operationForm, editedValues);
    setEditedValues({});
  }, [editedValues, operationForm, setOperationForm, updateMachiningOperationParams]);

  if (!operationForm || !editValues) {
    return null;
  }

  return (
    <Dialog onClose={abort} open>
      <DialogTitle>{t('title', { type: operationForm })}</DialogTitle>
      <DialogContent>
        <Stack
          direction="column"
          gap={2}
          sx={{ pt: 2 }}
        >
          {fieldParams.map(({ fieldName, precision, unitKey, step, min, max }) => {
            if (operationForm === TaskType.DRILL && fieldName === 'feedRateXY') {
              return null;
            }

            return (
              <InputField
                key={fieldName}
                label={t(`fields.${fieldName}`)}
                fieldName={fieldName}
                value={editValues[fieldName]}
                onChange={changeHandler(fieldName)}
                precision={precision}
                step={step}
                min={min}
                max={max}
                unitTranslationKey={unitKey}
              />
            );
          })}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          color="error"
          onClick={abort}
        >
          {t('abort')}
        </Button>
        <Button
          variant="contained"
          onClick={save}
        >
          {t('save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
