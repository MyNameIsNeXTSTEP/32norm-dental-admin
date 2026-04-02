"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function TreatmentPlanTable({ plan, totalAmount, updateQty, removeItem }) {
  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle className="text-sm">План лечения</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Услуга</TableHead>
              <TableHead>Цена</TableHead>
              <TableHead>Кол-во</TableHead>
              <TableHead>Сумма</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {!plan.length ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  План пуст
                </TableCell>
              </TableRow>
            ) : (
              plan.map((item, index) => {
                const sum = typeof item.price === "number" ? item.price * item.quantity : null;
                return (
                  <TableRow key={`${item.name}_${index}`}>
                    <TableCell className="max-w-[280px] truncate">{item.name}</TableCell>
                    <TableCell>
                      {typeof item.price === "number" ? `${item.price} ₽` : item.price}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(event) => updateQty(index, event.target.value)}
                        className="h-9 w-20 text-center"
                      />
                    </TableCell>
                    <TableCell>{sum === null ? "—" : `${sum.toLocaleString()} ₽`}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => removeItem(index)}>
                        Удалить
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3} className="font-semibold">
                ИТОГО:
              </TableCell>
              <TableCell className="font-semibold">{totalAmount.toLocaleString()} ₽</TableCell>
              <TableCell />
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
}
