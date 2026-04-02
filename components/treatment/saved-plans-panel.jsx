"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function SavedPlansPanel({
  savedSearch,
  setSavedSearch,
  filteredSavedPlans,
  loadSavedPlanById,
  deleteSavedPlanById,
}) {
  return (
    <Card>
      <CardContent className="space-y-3 pt-4">
      <Input
        type="text"
        value={savedSearch}
        onChange={(event) => setSavedSearch(event.target.value)}
        placeholder="Поиск по пациенту..."
        className="h-10"
      />
      {!filteredSavedPlans.length ? (
        <div className="rounded-xl border border-dashed border-border bg-background/70 p-6 text-center text-sm text-muted-foreground">
          Нет сохраненных планов
        </div>
      ) : (
        <div className="space-y-2">
          {filteredSavedPlans.map((item) => (
            <div
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-background p-3"
              key={item.id}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{item.patient_name || "Без имени"}</p>
                <Badge variant="secondary" className="mt-1">
                  {item.plan_date || "-"}
                </Badge>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button size="sm" onClick={() => loadSavedPlanById(item.id)}>
                  Загрузить
                </Button>
                <Button variant="destructive" size="sm" onClick={() => deleteSavedPlanById(item.id)}>
                  Удалить
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      </CardContent>
    </Card>
  );
}
