"use client"

import type React from "react"

import { useState } from "react"
import { X, Save, Calculator } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useInventory, type CashRegister } from "@/components/inventory-provider"

interface CashRegisterFormProps {
  type: "open" | "close"
  cashRegister?: CashRegister
  expectedAmount?: number
  onClose: () => void
}

export function CashRegisterForm({ type, cashRegister, expectedAmount = 0, onClose }: CashRegisterFormProps) {
  const { openCashRegister, closeCashRegister } = useInventory()

  const [amount, setAmount] = useState(type === "close" ? expectedAmount : 0)
  const [responsible, setResponsible] = useState("")
  const [notes, setNotes] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (amount < 0) {
      alert("El monto no puede ser negativo")
      return
    }

    if (!responsible.trim()) {
      alert("Por favor ingresa el nombre del responsable")
      return
    }

    if (type === "open") {
      openCashRegister(amount, responsible.trim(), notes.trim() || undefined)
    } else if (type === "close" && cashRegister) {
      closeCashRegister(amount, responsible.trim(), notes.trim() || undefined)
    }

    onClose()
  }

  const difference = type === "close" ? amount - expectedAmount : 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            {type === "open" ? "Abrir Caja Registradora" : "Cerrar Caja Registradora"}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {type === "close" && cashRegister && (
              <div className="p-3 bg-blue-50 rounded-lg space-y-2">
                <h4 className="font-medium text-blue-900">Información de Apertura</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Abierta por:</span>
                    <span className="font-medium">{cashRegister.openedBy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monto inicial:</span>
                    <span className="font-medium">${cashRegister.openingAmount.toLocaleString("es-CO")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hora apertura:</span>
                    <span className="font-medium">
                      {new Date(cashRegister.openingTime).toLocaleTimeString("es-CO")}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="amount">
                {type === "open" ? "Monto de Apertura (COP) *" : "Monto de Cierre (COP) *"}
              </Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="0"
                min="0"
                step="100"
                required
                className="text-lg font-bold"
              />
              {type === "open" && (
                <p className="text-xs text-gray-500 mt-1">Dinero en efectivo con el que inicias el día</p>
              )}
            </div>

            {type === "close" && (
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                  <h4 className="font-medium text-gray-900">Resumen de Cierre</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Monto esperado:</span>
                      <span className="font-medium">${expectedAmount.toLocaleString("es-CO")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monto contado:</span>
                      <span className="font-medium text-blue-600">${amount.toLocaleString("es-CO")}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span>Diferencia:</span>
                      <span
                        className={`font-bold ${
                          difference > 0 ? "text-green-600" : difference < 0 ? "text-red-600" : "text-gray-600"
                        }`}
                      >
                        {difference > 0 ? "+" : ""}${difference.toLocaleString("es-CO")}
                      </span>
                    </div>
                  </div>
                  {difference !== 0 && (
                    <div
                      className={`text-xs p-2 rounded ${
                        difference > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {difference > 0
                        ? "💰 Sobrante en caja - Verifica ventas adicionales"
                        : "⚠️ Faltante en caja - Revisa movimientos y gastos"}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="responsible">Responsable *</Label>
              <Input
                id="responsible"
                value={responsible}
                onChange={(e) => setResponsible(e.target.value)}
                placeholder="Nombre del responsable"
                required
              />
            </div>

            <div>
              <Label htmlFor="notes">Notas (Opcional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observaciones, incidencias, etc..."
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                Cancelar
              </Button>
              <Button
                type="submit"
                className={`flex-1 ${
                  type === "open" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                <Save className="h-4 w-4 mr-2" />
                {type === "open" ? "Abrir Caja" : "Cerrar Caja"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
