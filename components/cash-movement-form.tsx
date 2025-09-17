"use client"

import type React from "react"

import { useState } from "react"
import { X, Save, TrendingUp, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useInventory } from "@/components/inventory-provider"

interface CashMovementFormProps {
  cashRegisterId: string
  onClose: () => void
}

const movementTypes = [
  { value: "income", label: "Ingreso", icon: TrendingUp, color: "text-green-600" },
  { value: "expense", label: "Gasto", icon: TrendingDown, color: "text-red-600" },
  { value: "withdrawal", label: "Retiro", icon: TrendingDown, color: "text-orange-600" },
  { value: "deposit", label: "Depósito", icon: TrendingUp, color: "text-blue-600" },
]

const categories = [
  "Compras",
  "Servicios",
  "Mantenimiento",
  "Transporte",
  "Publicidad",
  "Suministros",
  "Otros ingresos",
  "Retiro personal",
  "Depósito bancario",
  "Otros",
]

export function CashMovementForm({ cashRegisterId, onClose }: CashMovementFormProps) {
  const { addCashMovement } = useInventory()

  const [type, setType] = useState<"income" | "expense" | "withdrawal" | "deposit">("expense")
  const [amount, setAmount] = useState(0)
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (amount <= 0) {
      alert("El monto debe ser mayor a cero")
      return
    }

    if (!description.trim()) {
      alert("Por favor ingresa una descripción")
      return
    }

    if (!category) {
      alert("Por favor selecciona una categoría")
      return
    }

    addCashMovement({
      cashRegisterId,
      type,
      amount,
      description: description.trim(),
      category,
    })

    onClose()
  }

  const selectedType = movementTypes.find((t) => t.value === type)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {selectedType && <selectedType.icon className="h-5 w-5" />}
            Registrar Movimiento de Caja
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="type">Tipo de Movimiento *</Label>
              <Select value={type} onValueChange={(value: any) => setType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {movementTypes.map((movementType) => (
                    <SelectItem key={movementType.value} value={movementType.value}>
                      <div className="flex items-center gap-2">
                        <movementType.icon className={`h-4 w-4 ${movementType.color}`} />
                        <span>{movementType.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount">Monto (COP) *</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="0"
                min="0"
                step="100"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Descripción *</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe el movimiento..."
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Categoría *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {amount > 0 && (
              <div
                className={`p-3 rounded-lg ${type === "expense" || type === "withdrawal" ? "bg-red-50" : "bg-green-50"}`}
              >
                <div className="text-sm text-gray-600">Resumen:</div>
                <div className={`font-bold ${selectedType?.color}`}>
                  {type === "expense" || type === "withdrawal" ? "-" : "+"}${amount.toLocaleString("es-CO")}
                </div>
                <div className="text-xs text-gray-500">{selectedType?.label}</div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                Cancelar
              </Button>
              <Button
                type="submit"
                className={`flex-1 ${type === "expense" || type === "withdrawal" ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}
              >
                <Save className="h-4 w-4 mr-2" />
                Registrar Movimiento
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
