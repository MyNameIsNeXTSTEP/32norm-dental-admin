"use client";

import { Card, CardContent } from "@/components/ui/card";

export function SessionCheckScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4 text-foreground">
      <Card className="w-full max-w-md text-center shadow-lg shadow-black/5 dark:shadow-black/20">
        <CardContent className="pt-1">
        <p className="text-sm text-muted-foreground">Проверка сессии...</p>
        </CardContent>
      </Card>
    </main>
  );
}
