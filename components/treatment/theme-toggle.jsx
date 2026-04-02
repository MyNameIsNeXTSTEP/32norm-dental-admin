"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle({ theme, onToggle, showLabel = true }) {
  const isDark = theme === "dark";

  return (
    <Button variant="outline" size="sm" onClick={onToggle} aria-label="Переключить тему">
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      {showLabel ? (isDark ? "Светлая тема" : "Темная тема") : null}
    </Button>
  );
}
