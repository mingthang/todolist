// src/components/TodoList.tsx
"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { Button }  from "@/components/ui/button";
import { Input }   from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import FilterTabs, { FilterTabsProps }  from "@/components/FilterTabs";
import TaskList    from "@/components/TaskList";

export interface Task {
  id: number;
  title: string;
  dueDay: string;
  description: string;
  completed: boolean;
}

export default function TodoList() {
  const [tasks, setTasks]           = useState<Task[]>([]);
  const [newTaskTitle, setNewTask]  = useState("");
  const [editing, setEditing]       = useState<Task | null>(null);
  const [activeTab, setActiveTab]   = useState<FilterTabsProps["activeTab"]>("all");
  const [page, setPage]             = useState(0);
  const perPage = 5;

  // load once
  useEffect(() => {
    const saved = localStorage.getItem("tasks");
    if (saved) setTasks(JSON.parse(saved));
  }, []);

  // save on change
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    const t: Task = { id: Date.now(), title: newTaskTitle.trim(), dueDay: "", description: "", completed: false };
    setTasks(ts => [...ts, t]);
    setNewTask("");
    setPage(Math.ceil((tasks.length + 1)/perPage) - 1);
  };

  const toggleTask    = (id: number) => setTasks(ts => ts.map(t => t.id===id?{...t,completed:!t.completed}:t));
  const deleteTask    = (id: number) => setTasks(ts => ts.filter(t=>t.id!==id));
  const startEdit     = (t: Task)   => setEditing(t);
  const saveEdit      = ()          => { if(editing){ setTasks(ts=>ts.map(t=>t.id===editing.id?editing:t)); setEditing(null);} };

  const getLabel      = (d: string) => {
    const today = new Date(); today.setHours(0,0,0,0);
    const due   = new Date(d);      due.setHours(0,0,0,0);
    const diff  = (due.getTime()-today.getTime())/(1000*60*60*24);
    if (diff===0) return "Today";
    if (diff===1) return "Tomorrow";
    return d;
  };

  const isOverdue     = (t: Task)   => {
    if (!t.dueDay) return false;
    const today = new Date(); today.setHours(0,0,0,0);
    const due   = new Date(t.dueDay); due.setHours(0,0,0,0);
    return ((due.getTime()-today.getTime())/(1000*60*60*24))<0 && !t.completed;
  };

  // filtering
  const filtered = tasks.filter(t => {
    const today = new Date().toISOString().split("T")[0];
    const due   = t.dueDay;
    switch(activeTab) {
      case "today":    return due===today;
      case "upcoming": return due>today;
      case "overdue":  return due !== "" && due < today && !t.completed;;
      case "completed":return t.completed;
      default:         return true;
    }
  });

  // pagination
  const totalPages  = Math.max(Math.ceil(filtered.length / perPage), 1);
  const currentList = filtered.slice(page*perPage, (page+1)*perPage);

  useEffect(() => {
    const lastPage = totalPages - 1
    if (page > lastPage) {
      setPage(lastPage)
    }
  }, [totalPages, page])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="inline-block w-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Todo List</h1>

        <FilterTabs
          activeTab={activeTab}
          setActiveTab={t => { setActiveTab(t); setPage(0); }}
        />

        <div className="flex items-center mb-4">
          <Input
            placeholder="Task title"
            value={newTaskTitle}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setNewTask(e.target.value)}
            className="flex-1 mr-2"
          />
          <Button onClick={addTask}>Add</Button>
        </div>

        <TaskList
          tasks={currentList}
          toggleTask={toggleTask}
          deleteTask={deleteTask}
          startEdit={startEdit}
          isOverdue={isOverdue}
          getLabel={getLabel}
        />

        <div className="flex justify-between items-center mt-4">
          <Button onClick={()=>setPage(p=>Math.max(p-1,0))} disabled={page===0}>Prev</Button>
          <span className="text-gray-800 dark:text-gray-200">Page {page+1} / {totalPages}</span>
          <Button onClick={()=>setPage(p=>Math.min(p+1,totalPages-1))} disabled={page>=totalPages-1}>Next</Button>
        </div>

        {editing && (
          <Dialog open onOpenChange={()=>setEditing(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Task</DialogTitle>
              </DialogHeader>
              <Input
                value={editing.title}
                onChange={e=>setEditing({...editing!,title:e.target.value})}
                className="mb-2"
              />
              <Input
                type="date"
                value={editing.dueDay}
                onChange={e=>setEditing({...editing!,dueDay:e.target.value})}
                className="mb-2"
              />
              <Input
                value={editing.description}
                onChange={e=>setEditing({...editing!,description:e.target.value})}
                className="mb-2"
              />
              <div className="flex items-center mb-4">
                <Checkbox
                  checked={editing.completed}
                  onCheckedChange={()=>setEditing({...editing!,completed:!editing.completed})}
                  className="mr-2"
                />
                <span className="text-gray-800 dark:text-gray-200">Completed</span>
              </div>
              <Button onClick={saveEdit}>Save</Button>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>  );
}
