// src/components/FilterTabs.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Task } from "./TodoApp";

export interface FilterTabsProps {
  activeTab: "all" | "today" | "upcoming" | "overdue" | "completed";
  setActiveTab: (tab: FilterTabsProps["activeTab"]) => void;
}

export default function FilterTabs({ activeTab, setActiveTab }: FilterTabsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {[
        { key: "all",      label: "All"       },
        { key: "today",    label: "My Day"    },
        { key: "upcoming", label: "Upcoming" },
        { key: "overdue",  label: "Overdue"   },
        { key: "completed",label: "Completed" },
      ].map(({ key, label }) => (
        <Button
          key={key}
          variant={activeTab === key ? "default" : "outline"}
          onClick={() => setActiveTab(key as any)}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
