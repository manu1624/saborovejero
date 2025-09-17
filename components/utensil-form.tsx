"use client"

import type React from "react"

import { useState } from "react"
import { X, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useInventory } from "@/components/inventory-provider"

interface UtensilFormProps {
  onClose: () => void
  categories: string[]
  utensilId?: string
}

const conditions = [
  { value: "excelente", label: "Excelente", color: "text-green-600" },
  { value: "bueno", label: "Bueno", color: "text-blue-600" },
  { value: "regular", label: "Regular", color: "text-yellow-600" },
  { value: "malo", label: "Malo", color: "text-orange-600" },
  { value: "dañado", label: "Dañado", color: "text-red-600" },
]

export function UtensilForm({ onClose, categories, utensilId }: UtensilFormProps) {
  const { utensils, addUtensil, updateUtensil } = useInventory()
  const existingUtensil = utensilId ? utensils.find((u) => u.id === utensilId) : null

  const [formData, setFormData] = useState({
    name: existingUtensil?.name || "",
    category: existingUtensil?.category || "",
    purchasePrice: existingUtensil?.purchasePrice || 0,
    currentQuantity: existingUtensil?.currentQuantity || 0,
    minQuantity: existingUtensil?.minQuantity || 0,
    condition: existingUtensil?.condition || "bueno",
    location: existingUtensil?.location || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.category || !formData.location) {
      alert("Por favor completa todos los campos obligatorios")
      return
    }

    if (existingUtensil) {
      updateUtensil(existingUtensil.id, formData)
    } else {
      addUtensil(formData)
    }

    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-white max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{existingUtensil ? "Editar Utensilio" : "Nuevo Utensilio"}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre del Utensilio *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Ej: Horno Industrial"
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Categoría *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="location">Ubicación *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="Ej: Cocina Principal, Área de Servicio"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="purchasePrice">Precio por Unidad (COP)</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData((prev) => ({ ...prev, purchasePrice: Number(e.target.value) }))}
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="condition">Estado</Label>
                <Select
                  value={formData.condition}
                  onValueChange={(value: any) => setFormData((prev) => ({ ...prev, condition: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map((condition) => (
                      <SelectItem key={condition.value} value={condition.value}>
                        <span className={condition.color}>{condition.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.purchasePrice > 0 && formData.currentQuantity > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-600 mb-2">Cálculo de Inversión:</div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Precio por unidad:</span>
                    <span className="font-medium">${formData.purchasePrice.toLocaleString("es-CO")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Cantidad:</span>
                    <span className="font-medium">{formData.currentQuantity} unidades</span>
                  </div>
                  <div className="border-t pt-1 flex justify-between font-semibold">
                    <span>Inversión Total:</span>
                    <span className="text-blue-700">
                      ${(formData.purchasePrice * formData.currentQuantity).toLocaleString("es-CO")}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currentQuantity">Cantidad Actual</Label>
                <Input
                  id="currentQuantity"
                  type="number"
                  value={formData.currentQuantity}
                  onChange={(e) => setFormData((prev) => ({ ...prev, currentQuantity: Number(e.target.value) }))}
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="minQuantity">Cantidad Mínima</Label>
                <Input
                  id="minQuantity"
                  type="number"
                  value={formData.minQuantity}
                  onChange={(e) => setFormData((prev) => ({ ...prev, minQuantity: Number(e.target.value) }))}
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1 bg-amber-600 hover:bg-amber-700">
                <Save className="h-4 w-4 mr-2" />
                {existingUtensil ? "Actualizar" : "Guardar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
