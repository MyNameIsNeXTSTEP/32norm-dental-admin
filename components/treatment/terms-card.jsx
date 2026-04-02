"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function TermsCard() {
  return (
    <Alert className="border-amber-300/40 bg-amber-50/70 text-amber-950 dark:bg-amber-500/10 dark:text-amber-100">
      <AlertTitle>Срок действия плана: два месяца со дня подписания.</AlertTitle>
      <AlertDescription>
        <p>В дальнейшем стоимость может измениться.</p>
        <p>
          Также согласно договору стоимость может измениться в процессе операции, о чем пациент будет
          предупрежден устно.
        </p>
        <p className="mt-3 border-t border-amber-400/30 pt-2">
          С условиями согласен. Подпись _________________
        </p>
      </AlertDescription>
    </Alert>
  );
}
