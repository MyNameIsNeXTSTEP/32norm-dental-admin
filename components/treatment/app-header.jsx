"use client";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/treatment/theme-toggle";

export function AppHeader({ user, theme, onThemeToggle, onLogout }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border/70 px-4 py-4 sm:px-6 print:hidden">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">ООО "32-Норма"</h1>
        <p className="text-sm text-muted-foreground">
          Врач: {user.display_name || user.login || "—"} {user.login ? `(${user.login})` : ""}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle theme={theme} onToggle={onThemeToggle} />
        <Button variant="outline" size="sm" onClick={onLogout}>
          Выйти
        </Button>
      </div>
    </header>
  );
}
