'use client';

import { useMainContext } from '@/components/MainContext';
import { useDownloadNC } from '@/hooks/useDownloadNC.ts';
import './styles.scss';
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
  const { renderedTasks, updateTask, busy } = useMainContext();
  const { downloadNCCode } = useDownloadNC();
  if (!renderedTasks.length) { return null; }

  return (
    <div className="task-list">
      {renderedTasks.map((task) => {
        const { fileName, type, steps, offset, units } = task;
        return (
          <span
            key={fileName}
            className="task-list__entry"
          >
            <button
              className="task-list__button"
              disabled={busy}
              onClick={() => {
                updateTask({
                  ...task,
                  hideAreas: !task.hideAreas,
                });
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
                updateTask({
                  ...task,
                  hidePaths: !task.hidePaths,
                });
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
                downloadNCCode(task);
              }}
            >
              <span>
              💾
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
                    updateTask({
                      ...task,
                      steps: Math.max(0, task.steps - 1),
                    });
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
                    updateTask({
                      ...task,
                      steps: Math.min(10, task.steps + 1),
                    });
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
                <code>
                  {`offset ${offset.toFixed(2)}${units}`}
                </code>
                <button
                  className="task-list__button"
                  disabled={busy}
                  onClick={() => {
                    updateTask({
                      ...task,
                      offset: Math.max(0, task.offset - 0.05),
                    });
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
                    updateTask({
                      ...task,
                      offset: Math.min(2, task.offset + 0.05),
                    });
                  }}
                >
                  <span>
                  +
                  </span>
                </button>
              </>
            )}
          </span>
        );
      })}
    </div>
  );
}
