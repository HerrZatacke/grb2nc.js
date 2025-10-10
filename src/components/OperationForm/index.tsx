'use client';

import './styles.scss';
import { useTranslations } from 'next-intl';
import { useCallback } from 'react';
import { InputField } from '@/components/InputField';
import { useMainContext } from '@/components/MainContext';
import { MachiningParams } from '@/types/machining.ts';
import { TaskType } from '@/types/tasks.ts';

const numberFieldNames: (keyof MachiningParams)[] = [
  'originOffsetX',
  'originOffsetY',
  'safeHeight',
  'clearanceHeight',
  'workHeight',
  'cutDepth',
  'stepDepth',
  'feedRateXY',
  'plungeSpeed',
  'retractSpeed',
  'spindleSpeed',
];

export default function OperationForm() {
  const {
    globalUnits,
    operationForm,
    machiningOperations,
    updateMachiningOperationParam,
  } = useMainContext();
  const operationValues = operationForm && machiningOperations?.[operationForm] || null;
  const t = useTranslations('OperationForm');

  const changeHandler = useCallback((fieldName: keyof MachiningParams) => (value: string) => {
    if (!operationForm) { return; }
    updateMachiningOperationParam(operationForm, fieldName, value);
  }, [operationForm, updateMachiningOperationParam]);

  if (!operationValues) {
    return null;
  }

  return (
    <div className="operations-form">
      { numberFieldNames.map((fieldName) => {
        if (operationForm === TaskType.DRILL && fieldName === 'feedRateXY') {
          return null;
        }

        return (
          <InputField
            key={fieldName}
            label={t(`fields.${fieldName}`)}
            fieldName={fieldName}
            value={operationValues[fieldName]}
            onChange={changeHandler(fieldName)}
            precision={2}
            unit={globalUnits}
          />
        );
      })}
    </div>
  );
}
