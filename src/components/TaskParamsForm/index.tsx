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
import { EditableTask, TaskType } from '@/types/tasks.ts';

export default function TaskParamsForm() {
  const {
    taskForm,
    tasks,
    updateTaskParams,
    setTaskForm,
  } = useMainContext();
  const t = useTranslations('TaskParamsForm');

  const [editedValues, setEditedValues] = useState<Partial<EditableTask>>({});

  const task = useMemo(() => (
    taskForm && tasks.find(({ fileName }) => (fileName === taskForm)) || null
  ), [taskForm, tasks]);

  const editValues: EditableTask | null = useMemo(() => {
    if (!task) { return null; }

    return ({
      ...task,
      ...editedValues,
    });
  }, [editedValues, task]);

  const changeHandler = useCallback((fieldName: keyof EditableTask) => (value: string) => {
    setEditedValues((current) => ({
      ...current,
      [fieldName]: parseFloat(value),
    }));
  }, []);

  const abort = useCallback(() => {
    setTaskForm('');
    setEditedValues({});
  }, [setTaskForm]);

  const save = useCallback(() => {
    if (!taskForm) { return; }
    setTaskForm('');
    updateTaskParams(taskForm, editedValues);
    setEditedValues({});
  }, [editedValues, setTaskForm, taskForm, updateTaskParams]);

  if (!task || !editValues) {
    return null;
  }

  const { type } = task;

  return (
    <Dialog onClose={abort} open>
      <DialogTitle>{t('title', { fileName: task.fileName })}</DialogTitle>
      <DialogContent>
        {editValues && (
          <Stack
            direction="column"
            gap={2}
            sx={{ pt: 2 }}
          >
            {type === TaskType.ISOLATION && (
              <InputField
                label="Steps"
                fieldName={`${type}-steps`}
                value={editValues.steps.toFixed(0)}
                precision={0}
                step={1}
                min={0}
                max={10}
                unitTranslationKey="none"
                onChange={changeHandler('steps')}
              />
            )}
            {type !== TaskType.DRILL && (
              <InputField
                label="Offset"
                fieldName={`${type}-offset`}
                value={editValues.offset.toFixed(2)}
                precision={2}
                step={0.01}
                min={0}
                max={5}
                unitTranslationKey="dimension"
                onChange={changeHandler('offset')}
              />
            )}
          </Stack>
        )}
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
