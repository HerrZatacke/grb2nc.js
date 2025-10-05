'use client';

import {useMainContext} from '@/components/MainContext';
import './styles.scss';

export default function TaskList() {
  const { tasks, updateTask } = useMainContext();
  if (!tasks.length) { return null; }

  return (
    <div className="task-list">
      {tasks.map((task) => {
        const { fileName, type } = task;
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
            <span>
              {fileName}: {type}
            </span>
          </span>
        );
      })}
    </div>
  );
}
