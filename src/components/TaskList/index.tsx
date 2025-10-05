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
  const { renderedTasks, updateTask } = useMainContext();
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
            <code>
              {`${steps} steps each ${offset}${units}`}
            </code>
          </span>
        );
      })}
    </div>
  );
}
