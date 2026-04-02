"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function CategoryTabs({ currentCat, onSelect }) {
  return (
    <Tabs value={currentCat} onValueChange={onSelect}>
      <TabsList className="w-full justify-start p-1">
        <TabsTrigger value="surgery">Хирургия</TabsTrigger>
        <TabsTrigger value="ortho">Ортопедия</TabsTrigger>
        <TabsTrigger value="saved">Сохраненные планы</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
