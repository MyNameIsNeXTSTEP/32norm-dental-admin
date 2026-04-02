"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PatientDetailsForm({
  patientName,
  setPatientName,
  planDate,
  setPlanDate,
  doctorName,
  setDoctorName,
}) {
  return (
    <Card>
      <CardContent className="grid gap-3 pt-4 sm:grid-cols-3">
      <div className="space-y-1.5">
        <Label htmlFor="patientName">Пациент</Label>
        <Input
          id="patientName"
          type="text"
          value={patientName}
          onChange={(event) => setPatientName(event.target.value)}
          placeholder="Иванов И.И."
          className="h-10"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="planDate">Дата</Label>
        <Input
          id="planDate"
          type="date"
          value={planDate}
          onChange={(event) => setPlanDate(event.target.value)}
          className="h-10"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="doctorName">Врач</Label>
        <Input
          id="doctorName"
          type="text"
          value={doctorName}
          onChange={(event) => setDoctorName(event.target.value)}
          placeholder="Петров П.П."
          className="h-10"
        />
      </div>
      </CardContent>
    </Card>
  );
}
