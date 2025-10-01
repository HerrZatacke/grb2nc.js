'use client';

import {useMainContext} from "@/components/MainContext";

export default function TaskList() {
  const { tasks } = useMainContext();
  return (
    <div>
      <pre>{JSON.stringify(tasks.map(({ flip, type }) => ({ flip, type })), null, 2)}</pre>
    </div>
  );
}
