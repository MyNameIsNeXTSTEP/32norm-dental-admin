"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export function ServicesCatalogPanel({
  searchText,
  setSearchText,
  filteredServices,
  addToPlan,
  deleteService,
  parseFile,
  isParsingFile,
  ocrResult,
  ocrText,
  addParsedServices,
  isAddFormVisible,
  setIsAddFormVisible,
  newName,
  setNewName,
  newPrice,
  setNewPrice,
  addNewService,
}) {
  return (
    <>
      <Input
        id="searchInput"
        type="text"
        value={searchText}
        onChange={(event) => setSearchText(event.target.value)}
        placeholder="Поиск услуги..."
        className="h-10"
      />

      <Card className="max-h-[360px] overflow-y-auto">
        <CardContent className="space-y-2 pt-4">
        {!filteredServices.length ? (
          <div className="rounded-xl border border-dashed border-border bg-background/70 p-6 text-center text-sm text-muted-foreground">
            Ничего не найдено
          </div>
        ) : (
          filteredServices.map((item) => (
            <div
              className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background p-3"
              key={`${item.name}_${String(item.price)}`}
            >
              <div className="min-w-0 space-y-1">
                <p className="truncate text-sm font-medium">{item.name}</p>
                <Badge variant="secondary">
                  {typeof item.price === "number" ? `${item.price} ₽` : `${item.price} ₽`}
                </Badge>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button size="sm" onClick={() => addToPlan(item)}>
                  Добавить
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteService(item.name)}
                  title="Удалить из прайса"
                >
                  Удалить
                </Button>
              </div>
            </div>
          ))
        )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-sm">Загрузить прайс-лист</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setIsAddFormVisible((prev) => !prev)}>
              Добавить вручную
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="price-file">Файл</Label>
            <Input id="price-file" type="file" accept="*/*" onChange={parseFile} className="h-10 pt-1" />
          </div>

          <div className="max-h-[220px] min-h-[96px] overflow-y-auto rounded-xl border border-border/70 bg-background p-3 text-sm whitespace-pre-wrap">
            {isParsingFile ? "Обработка..." : ocrResult}
          </div>

          {ocrText ? (
            <>
              <Separator />
              <Button size="sm" onClick={addParsedServices}>
                Добавить распознанное
              </Button>
            </>
          ) : null}
        </CardContent>
      </Card>

      {isAddFormVisible ? (
        <Card>
          <CardContent className="grid gap-3 pt-4 sm:grid-cols-[1fr_180px_auto]">
            <Input
              type="text"
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              placeholder="Название услуги"
              className="h-10"
            />
            <Input
              type="text"
              value={newPrice}
              onChange={(event) => setNewPrice(event.target.value)}
              placeholder="Цена"
              className="h-10"
            />
            <Button onClick={addNewService}>Сохранить</Button>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
