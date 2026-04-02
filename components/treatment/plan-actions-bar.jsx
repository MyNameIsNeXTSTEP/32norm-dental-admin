"use client";

import { Button } from "@/components/ui/button";

export function PlanActionsBar({ saveCurrentPlan, sendToMail, clearPlan }) {
  return (
    <div className="flex flex-wrap justify-end gap-2 print:hidden">
      <Button onClick={saveCurrentPlan}>Сохранить</Button>
      <Button variant="outline" onClick={sendToMail}>
        Отправить на Mail.ru
      </Button>
      <Button variant="outline" onClick={() => window.print()}>
        Печать
      </Button>
      <Button variant="destructive" onClick={clearPlan}>
        Очистить
      </Button>
    </div>
  );
}
