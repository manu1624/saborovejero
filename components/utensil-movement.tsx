"use client"

import type React from "react"

import { useState } from "react"
import { X, Plus, Minus, Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useInventory } from "@/components/inventory-provider"

interface UtensilMovementProps {
  onClose: () => void
  selectedUtensilId?: string | null
}

const conditionColors = {
  excelente: "bg-green-100 text-green-800",
  bueno: "bg-blue-100 text-blue-800",
  regular: "bg-yellow-100 text-yellow-800",
  malo: "bg-orange-100 text-orange-800",
  dañado: "bg-red-100 text-red-800",
}

export function UtensilMovement({ onClose, selectedUtensilId }: UtensilMovementProps) {
  const { utensils, updateUtensilQuantity } = useInventory()
  const [selectedUtensil, setSelectedUtensil] = useState(selectedUtensilId || "")
  const [quantity, setQuantity] = useState(0)
  const [operation, setOperation] = useState<"add" | "subtract">("add")
  const [reason, setReason] = useState("")

  const utensil = utensils.find((u) => u.id === selectedUtensil)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedUtensil || quantity <= 0) {
      alert("Por favor selecciona un utensilio y una cantidad válida")
      return
    }

    updateUtensilQuantity(selectedUtensil, quantity, operation)

    // Aquí podrías guardar el registro del movimiento en el futuro
    console.log("Movimiento de utensilio registrado:", {
      utensilId: selectedUtensil,
      quantity,
      operation,
      reason,
      timestamp: new Date().toISOString(),
    })

    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Movimiento de Utensilios
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="utensil">Utensilio *</Label>
              <Select value={selectedUtensil} onValueChange={setSelectedUtensil}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un utensilio" />
                </SelectTrigger>
                <SelectContent>
                  {utensils.map((utensil) => (
                    <SelectItem key={utensil.id} value={utensil.id}>
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <span className="font-medium">{utensil.name}</span>
                          <span className="text-sm text-gray-500 ml-2">({utensil.code})</span>
                        </div>
                        <Badge variant="outline" className="ml-2">
                          {utensil.currentQuantity} unidades
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {utensil && (
              <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Cantidad actual:</span>
                  <span className="text-lg font-semibold">{utensil.currentQuantity} unidades</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Mínimo:</span>
                  <span className="text-sm">{utensil.minQuantity} unidades</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Estado:</span>
                  <Badge className={conditionColors[utensil.condition]} variant="secondary">
                    {utensil.condition.charAt(0).toUpperCase() + utensil.condition.slice(1)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Ubicación:</span>
                  <span className="text-sm">{utensil.location}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Precio unitario:</span>
                  <span className="text-sm font-medium">${utensil.purchasePrice.toLocaleString("es-CO")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Valor total:</span>
                  <span className="text-sm font-semibold text-green-600">
                    ${(utensil.currentQuantity * utensil.purchasePrice).toLocaleString("es-CO")}
                  </span>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="operation">Tipo de Movimiento *</Label>
              <Select value={operation} onValueChange={(value: "add" | "subtract") => setOperation(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4 text-green-600" />
                      Entrada (Agregar Utensilios)
                    </div>
                  </SelectItem>
                  <SelectItem value="subtract">
                    <div className="flex items-center gap-2">
                      <Minus className="h-4 w-4 text-red-600" />
                      Salida (Retirar Utensilios)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="quantity">Cantidad *</Label>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                placeholder="0"
                min="1"
                step="1"
                required
              />
              <div className="text-sm text-gray-500 mt-1">Unidades</div>
            </div>

            <div>
              <Label htmlFor="reason">Motivo (opcional)</Label>
              <Input
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ej: Compra nueva, Rotura, Mantenimiento, etc."
              />
            </div>

            {utensil && quantity > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg space-y-2">
                <div className="text-sm text-blue-600">Resultado:</div>
                <div className="font-semibold">
                  {operation === "add"
                    ? `${utensil.currentQuantity} + ${quantity} = ${utensil.currentQuantity + quantity}`
                    : `${utensil.currentQuantity} - ${quantity} = ${Math.max(0, utensil.currentQuantity - quantity)}`}{" "}
                  unidades
                </div>
                <div className="text-sm text-gray-600">
                  Nuevo valor total: ${" "}
                  <span className="font-semibold text-green-600">
                    {operation === "add"
                      ? ((utensil.currentQuantity + quantity) * utensil.purchasePrice).toLocaleString("es-CO")
                      : (Math.max(0, utensil.currentQuantity - quantity) * utensil.purchasePrice).toLocaleString(
                          "es-CO",
                        )}
                  </span>
                </div>
                {operation === "subtract" && quantity > utensil.currentQuantity && (
                  <div className="text-sm text-red-600 mt-1">⚠️ La cantidad excede las unidades disponibles</div>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                Cancelar
              </Button>
              <Button
                type="submit"
                className={`flex-1 ${operation === "add" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
              >
                {operation === "add" ? (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar
                  </>
                ) : (
                  <>
                    <Minus className="h-4 w-4 mr-2" />
                    Retirar
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
