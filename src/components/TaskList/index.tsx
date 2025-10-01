'use client';

import {useMainContext} from "@/components/MainContext";
import './styles.scss';

export default function TaskList() {
  const { tasks } = useMainContext();
  return (
    <div className="task-list">
      {tasks.map(({ fileName, type }) => (
        <div className="task-list__entry">
          { fileName }: { type }
        </div>
      ))}
    </div>
  );
}
