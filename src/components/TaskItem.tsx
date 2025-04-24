// src/components/TaskItem.tsx
"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Button }   from "@/components/ui/button";
import { Task }     from "./TodoApp";

interface TaskItemProps {
  task: Task;
  toggleTask: (id: number) => void;
  deleteTask: (id: number) => void;
  startEdit:  (t: Task) => void;
  isOverdue:  (t: Task) => boolean;
  getLabel:   (d: string) => string;
}

export default function TaskItem({
  task, toggleTask, deleteTask, startEdit, isOverdue, getLabel
}: TaskItemProps) {
  return (
    <div
      onClick={() => startEdit(task)}
      className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 rounded-md px-4 py-2 cursor-pointer"
    >
      <div className="flex-1 flex items-center">
        <Checkbox
          checked={task.completed}
          onClick={e => e.stopPropagation()}
          onCheckedChange={() => toggleTask(task.id)}
          className="mr-2"
        />
        <div className="flex flex-col">
          <span className={`text-gray-800 dark:text-gray-200 ${task.completed ? "line-through text-gray-500" : ""}`}>
            {task.title}
          </span>
          {task.dueDay && (
            <p className="text-sm text-gray-500">
              Due: <span className={isOverdue(task) ? "text-red-500" : "text-gray-500"}>
                {getLabel(task.dueDay)}
              </span>
            </p>
          )}
        </div>
      </div>
      <Button
        onClick={e => { e.stopPropagation(); deleteTask(task.id) }}
        className="bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-2 rounded-md"
      >
        Delete
      </Button>
    </div>
  );
}
