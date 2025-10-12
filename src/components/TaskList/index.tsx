'use client';

import List from '@mui/material/List';
import Paper from '@mui/material/Paper';
import { useMainContext } from '@/components/MainContext';
import TaskListEntry from '@/components/TaskListEntry';

export default function TaskList() {
  const { tasks, updateTask  } = useMainContext();
  if (!tasks.length) { return null; }

  return (
    <Paper>
      <List dense>
        {tasks.map((task) => {
          return (
            <TaskListEntry
              key={task.fileName}
              task={task}
              updateTask={updateTask}
            />
          );
        })}
      </List>
    </Paper>
  );
}
