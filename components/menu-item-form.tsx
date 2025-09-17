"use client"

import type React from "react"

import { useState } from "react"
import { X, Save, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useInventory, type RecipeIngredient } from "@/components/inventory-provider"

interface MenuItemFormProps {
  onClose: () => void
  menuItemId?: string | null
}

const menuCategories = [
  "Pizzería",
  "Lasaña",
  "Ensaladas de frutas + helados",
  "Aromáticas / Cafés",
  "Micheladas / Cócteles",
]

export function MenuItemForm({ onClose, menuItemId }: MenuItemFormProps) {
  const { menuItems, products, addMenuItem, updateMenuItem } = useInventory()
  const existingMenuItem = menuItemId ? menuItems.find((m) => m.id === menuItemId) : null

  const [formData, setFormData] = useState({
    name: existingMenuItem?.name || "",
    category: existingMenuItem?.category || "",
    price: existingMenuItem?.price || 0,
    description: existingMenuItem?.description || "",
    isAvailable: existingMenuItem?.isAvailable ?? true,
    preparationTime: existingMenuItem?.preparationTime || 0,
  })

  const [recipe, setRecipe] = useState<RecipeIngredient[]>(existingMenuItem?.recipe || [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.category || formData.price <= 0) {
      alert("Por favor completa todos los campos obligatorios")
      return
    }

    if (recipe.length === 0) {
      alert("Por favor agrega al menos un ingrediente a la receta")
      return
    }

    const menuItemData = {
      ...formData,
      recipe,
    }

    if (existingMenuItem) {
      updateMenuItem(existingMenuItem.id, menuItemData)
    } else {
      addMenuItem(menuItemData)
    }

    onClose()
  }

  const addIngredient = () => {
    setRecipe([...recipe, { productId: "", quantity: 0, unit: "" }])
  }

  const removeIngredient = (index: number) => {
    setRecipe(recipe.filter((_, i) => i !== index))
  }

  const updateIngredient = (index: number, field: keyof RecipeIngredient, value: string | number) => {
    const updatedRecipe = recipe.map((ingredient, i) => {
      if (i === index) {
        return { ...ingredient, [field]: value }
      }
      return ingredient
    })
    setRecipe(updatedRecipe)
  }

  const calculateTotalCost = () => {
    return recipe.reduce((total, ingredient) => {
      const product = products.find((p) => p.id === ingredient.productId)
      if (!product) return total
      return total + ingredient.quantity * product.price
    }, 0)
  }

  const calculateMargin = () => {
    const cost = calculateTotalCost()
    if (formData.price <= 0) return 0
    return ((formData.price - cost) / formData.price) * 100
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{existingMenuItem ? "Editar Producto del Menú" : "Nuevo Producto del Menú"}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Información del Producto</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre del Producto *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Ej: Pizza Margarita Personal"
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
                      {menuCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe el producto..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Precio de Venta (COP) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))}
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="preparationTime">Tiempo de Preparación (min)</Label>
                  <Input
                    id="preparationTime"
                    type="number"
                    value={formData.preparationTime}
                    onChange={(e) => setFormData((prev) => ({ ...prev, preparationTime: Number(e.target.value) }))}
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="isAvailable"
                    checked={formData.isAvailable}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isAvailable: checked }))}
                  />
                  <Label htmlFor="isAvailable">Disponible en el menú</Label>
                </div>
              </div>
            </div>

            {/* Receta */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Receta (Ingredientes)</h3>
                <Button type="button" onClick={addIngredient} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Ingrediente
                </Button>
              </div>

              {recipe.map((ingredient, index) => {
                const product = products.find((p) => p.id === ingredient.productId)
                return (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-5">
                      <Label>Ingrediente</Label>
                      <Select
                        value={ingredient.productId}
                        onValueChange={(value) => {
                          updateIngredient(index, "productId", value)
                          const selectedProduct = products.find((p) => p.id === value)
                          if (selectedProduct) {
                            updateIngredient(index, "unit", selectedProduct.unit)
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona ingrediente" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} ({product.code}) - Stock: {product.currentStock} {product.unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-3">
                      <Label>Cantidad</Label>
                      <Input
                        type="number"
                        value={ingredient.quantity}
                        onChange={(e) => updateIngredient(index, "quantity", Number(e.target.value))}
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Unidad</Label>
                      <Input
                        value={ingredient.unit}
                        onChange={(e) => updateIngredient(index, "unit", e.target.value)}
                        placeholder="kg, l, unidad"
                        readOnly={!!product}
                      />
                    </div>
                    <div className="col-span-1">
                      <Label>Costo</Label>
                      <div className="text-sm font-medium text-gray-600">
                        ${product ? (ingredient.quantity * product.price).toLocaleString("es-CO") : "0"}
                      </div>
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeIngredient(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}

              {recipe.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No hay ingredientes en la receta</p>
                  <p className="text-sm">Agrega ingredientes para calcular costos y márgenes</p>
                </div>
              )}
            </div>

            {/* Análisis de costos */}
            {recipe.length > 0 && formData.price > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg space-y-2">
                <h4 className="font-medium text-blue-900">Análisis de Rentabilidad</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Precio de venta:</span>
                      <span className="font-medium">${formData.price.toLocaleString("es-CO")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Costo ingredientes:</span>
                      <span className="font-medium">${calculateTotalCost().toLocaleString("es-CO")}</span>
                    </div>
                    <div className="flex justify-between border-t pt-1">
                      <span>Ganancia bruta:</span>
                      <span className="font-medium text-green-600">
                        ${(formData.price - calculateTotalCost()).toLocaleString("es-CO")}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Margen de ganancia:</span>
                      <span
                        className={`font-medium ${calculateMargin() > 50 ? "text-green-600" : calculateMargin() > 30 ? "text-yellow-600" : "text-red-600"}`}
                      >
                        {calculateMargin().toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">
                      {calculateMargin() > 50 && "✅ Excelente margen"}
                      {calculateMargin() > 30 && calculateMargin() <= 50 && "⚠️ Margen aceptable"}
                      {calculateMargin() <= 30 && "❌ Margen bajo"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1 bg-amber-600 hover:bg-amber-700">
                <Save className="h-4 w-4 mr-2" />
                {existingMenuItem ? "Actualizar" : "Guardar"} Producto
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
