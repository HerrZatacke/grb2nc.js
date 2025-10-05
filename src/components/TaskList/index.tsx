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
          <button
            key={fileName}
            className="task-list__entry"
            onClick={() => {
              updateTask({
                ...task,
                hide: !task.hide,
              });
            }}
          >
            <span>
            {task.hide ? '✖️' : '👁️'}
            </span>
            <span>
              {fileName}: {type}
            </span>
          </button>
        );
      })}
    </div>
  );
}
