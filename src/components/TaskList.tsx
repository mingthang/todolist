// src/components/TaskList.tsx
"use client";

import TaskItem from "./TaskItem";
import { Task } from "./TodoApp";

interface TaskListProps {
  tasks: Task[];
  toggleTask: (id: number) => void;
  deleteTask: (id: number) => void;
  startEdit:  (t: Task) => void;
  isOverdue:  (t: Task) => boolean;
  getLabel:   (d: string) => string;
}

export default function TaskList({
  tasks, toggleTask, deleteTask, startEdit, isOverdue, getLabel
}: TaskListProps) {
  return (
    <div className="space-y-2">
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          toggleTask={toggleTask}
          deleteTask={deleteTask}
          startEdit={startEdit}
          isOverdue={isOverdue}
          getLabel={getLabel}
        />
      ))}
    </div>
  );
}
