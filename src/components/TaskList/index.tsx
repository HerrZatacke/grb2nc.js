'use client';

import './styles.scss';
import { InputField } from '@/components/InputField';
import { useMainContext } from '@/components/MainContext';
import { useDownloadNC } from '@/hooks/useDownloadNC.ts';
import { TaskType } from '@/types/tasks.ts';

const typeIcon = (type: TaskType): string => {
  switch (type) {
    case TaskType.DRILL:
      return '🕳️';
    case TaskType.EDGE_CUT:
      return '🔪';
    case TaskType.ISOLATION:
      return '〰';
    default:
      return '';
  }
};

export default function TaskList() {
  const { tasks, updateTask, busy, setOprtationForm, globalUnits } = useMainContext();
  const { downloadNCCode } = useDownloadNC();
  if (!tasks.length) { return null; }

  return (
    <div className="task-list">
      {tasks.map((task, index) => {
        const { fileName, type, steps, offset } = task;
        return (
          <span
            key={fileName}
            className="task-list__entry"
          >
            <button
              className="task-list__button"
              disabled={busy}
              onClick={() => {
                updateTask(
                  task.fileName,
                  { hideAreas: !task.hideAreas },
                );
              }}
            >
              <span>
              {task.hideAreas ? '✖️' : '👁️'}
              </span>
            </button>
            <button
              className="task-list__button"
              disabled={busy}
              onClick={() => {
                updateTask(
                  task.fileName,
                  { hidePaths: !task.hidePaths },
                );
              }}
            >
              <span>
              {task.hidePaths ? '✖️' : '👁️'}
              </span>
            </button>
            <button
              className="task-list__button"
              disabled={busy}
              onClick={() => {
                downloadNCCode(task.fileName);
              }}
            >
              <span>
              💾
              </span>
            </button>
            <button
              className="task-list__button"
              disabled={busy}
              onClick={() => {
                setOprtationForm(task.type);
              }}
            >
              <span>
              ✏️
              </span>
            </button>
            <span>
              {typeIcon(type)}
            </span>
            <span>
              {fileName}
            </span>
            {type === TaskType.ISOLATION && (
              <>
                <code>
                  {`${steps.toFixed(0)} steps`}
                </code>
                <button
                  className="task-list__button"
                  disabled={busy}
                  onClick={() => {
                    updateTask(
                      task.fileName,
                      { steps: Math.max(0, task.steps - 1) },
                    );
                  }}
                >
                  <span>
                  -
                  </span>
                </button>
                <button
                  className="task-list__button"
                  disabled={busy}
                  onClick={() => {
                    updateTask(
                      task.fileName,
                      { steps: Math.min(10, task.steps + 1) },
                    );
                  }}
                >
                  <span>
                  +
                  </span>
                </button>
              </>
            )}
            {type !== TaskType.DRILL && (
              <>
                <InputField
                  label="Offset"
                  fieldName={`${type}-${index}-offset`}
                  value={offset.toFixed(2)}
                  precision={2}
                  step={0.01}
                  unit={globalUnits}
                  onChange={(newValue) => {
                    const numericValue = parseFloat(newValue);
                    updateTask(
                      task.fileName,
                      { offset: Math.min(2, Math.max(0, numericValue)) },
                    );
                  }}
                />
              </>
            )}
          </span>
        );
      })}
    </div>
  );
}
