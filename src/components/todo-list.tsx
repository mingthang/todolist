"use client";

import { useState, useEffect, ChangeEvent } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Task {
  id: number;
  title: string;
  dueDay: string;
  description: string;
  completed: boolean;
}

export default function TodoList() {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  // Công việc
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState<string>("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  // Tab công việc
  const [activeTab, setActiveTab] = useState<
  "all" | "today" | "upcoming" | "overdue" | "completed"
  >("all");
    // Phân trang
  const [currentPage, setCurrentPage] = useState<number>(0);
  const tasksPerPage = 5;


  useEffect(() => {
    setIsMounted(true);
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks) as Task[]);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("tasks", JSON.stringify(tasks));
    }
  }, [tasks, isMounted]);

  const addTask = (): void => {
    if (newTaskTitle.trim() !== "") {
      const newTask: Task = {
        id: Date.now(),
        title: newTaskTitle,
        dueDay: "",
        description: "",
        completed: false,
      };
      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      setNewTaskTitle("");
      // Khi thêm task mới, reset currentPage về trang cuối cùng
      const newLastPage = Math.ceil(updatedTasks.length / tasksPerPage) - 1;
      setCurrentPage(newLastPage);
    }
  };

  const toggleTaskCompletion = (id: number): void => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // Mở dialog chỉnh sửa khi nhấn vào khung task (container)
  const startEditingTask = (task: Task): void => {
    setEditingTask(task);
  };

  const updateTask = (): void => {
    if (editingTask) {
      setTasks(tasks.map((task) => (task.id === editingTask.id ? editingTask : task)));
      setEditingTask(null);
    }
  };

  const deleteTask = (id: number): void => {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    setTasks(updatedTasks);
    const totalPagesAfter = Math.ceil(updatedTasks.length / tasksPerPage);
    const newPage = totalPagesAfter > 0 && currentPage >= totalPagesAfter
      ? totalPagesAfter - 1
      : currentPage;
    setCurrentPage(newPage);
  };

  const getDueLabel = (dateString: string): string => {
    const today = new Date();
    const dueDate = new Date(dateString);
    // Đặt giờ về 0 để so sánh ngày
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    return dateString;
  };

  const isOverdueTask = (task: Task): boolean => {
    if (!task.dueDay) return false;
    const today = new Date();
    const due = new Date(task.dueDay);
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    const diff = (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diff < 0 && !task.completed;
  };

  // Filter các task dựa trên tab hiện tại
  const filtered = tasks.filter((task) => {
    if (!task.dueDay && ["today", "upcoming", "overdue"].includes(activeTab)) {
      return false;
    }
    const today = new Date();
    const due = new Date(task.dueDay);
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    const diff = (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

    switch (activeTab) {
      case "today": return diff === 0;
      case "upcoming": return diff > 0 && diff <= 7;
      case "overdue": return diff < 0 && !task.completed;
      case "completed": return task.completed;
      default: return true;
    }
  });

  // Tính toán danh sách task cần hiển thị theo trang hiện tại
  const indexOfLastTask = (currentPage + 1) * tasksPerPage;
  const indexOfFirstTask = currentPage * tasksPerPage;
  const totalPages = Math.max(Math.ceil(filtered.length / tasksPerPage), 1);
  const currentTasks = filtered.slice(indexOfFirstTask, indexOfLastTask);

  if (!isMounted) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="inline-block w-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
          Todo List
        </h1>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { key: 'all', label: 'All' },
            { key: 'today', label: 'My Day' },
            { key: 'upcoming', label: 'Upcoming' },
            { key: 'overdue', label: 'Overdue' },
            { key: 'completed', label: 'Completed' }
          ].map(({ key, label }) => (
            <Button
              key={key}
              variant={activeTab === key ? 'default' : 'outline'}
              onClick={() => { setActiveTab(key as any); setCurrentPage(0); }}
            >
              {label}
            </Button>
          ))}
        </div>

        {/* Input thêm task mới title */}
        <div className="flex items-center mb-4">
          <Input
            type="text"
            placeholder="Task title"
            value={newTaskTitle}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setNewTaskTitle(e.target.value)
            }
            className="flex-1 mr-2 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
          />
          <Button
            onClick={addTask}
            className="bg-black hover:bg-slate-800 text-white font-medium py-2 px-4 rounded-md"
          >
            Add
          </Button>
        </div>
        {/* Hiển thị danh sách tasks của trang hiện tại */}
        <div className="space-y-2">
          {currentTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => startEditingTask(task)}
              className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 rounded-md px-4 py-2 cursor-pointer"
            >
              <div className="flex-1 flex items-center">
                <Checkbox
                  checked={task.completed}
                  onClick={(e) => e.stopPropagation()}
                  onCheckedChange={(checked) => toggleTaskCompletion(task.id)}
                  className="mr-2"
                />
                {/* Thêm container flex-col cho title và due date */}
                <div className="flex flex-col">
                  <span
                    className={`text-gray-800 dark:text-gray-200 ${
                      task.completed ? "line-through text-gray-500" : ""
                    }`}
                  >
                    {task.title}
                  </span>
                  {task.dueDay && (
                    <p className="text-sm text-gray-500">
                      Due: <span className={isOverdueTask(task) ? 'text-red-500' : 'text-gray-500'}>{getDueLabel(task.dueDay)}</span>
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTask(task.id);
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-2 rounded-md"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
        {/* Phân trang */}
        <div className="flex justify-between items-center mt-4">
          <Button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
            disabled={currentPage === 0}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200 font-medium py-1 px-3 rounded-md"
          >
            Prev
          </Button>
          <span className="text-gray-800 dark:text-gray-200">
            Page {currentPage + 1} of {totalPages === 0 ? 1 : totalPages}
          </span>
          <Button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))
            }
            disabled={currentPage >= totalPages - 1}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200 font-medium py-1 px-3 rounded-md"
          >
            Next
          </Button>
        </div>
      </div>
      {/* Bảng chỉnh sửa task */}
      {editingTask && (
        <Dialog open={true} onOpenChange={() => setEditingTask(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
            </DialogHeader>
            <Input
              type="text"
              value={editingTask.title}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setEditingTask({ ...editingTask, title: e.target.value })
              }
              placeholder="Task title"
              className="mb-2"
            />
            <Input
              type="date"
              value={editingTask.dueDay}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setEditingTask({ ...editingTask, dueDay: e.target.value })
              }
              placeholder="Due day"
              className="mb-2"
            />
            <Input
              type="text"
              value={editingTask.description}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setEditingTask({ ...editingTask, description: e.target.value })
              }
              placeholder="Description"
              className="mb-2"
            />
            <div className="flex items-center mb-4">
              <Checkbox
                checked={editingTask.completed}
                onCheckedChange={() =>
                  setEditingTask({ ...editingTask, completed: !editingTask.completed })
                }
                className="mr-2"
              />
              <span className="text-gray-800 dark:text-gray-200">Completed</span>
            </div>
            <Button
              onClick={updateTask}
              className="bg-black hover:bg-slate-800 text-white font-medium py-2 px-4 rounded-md"
            >
              Save
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
