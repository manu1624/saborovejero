"use client"

import type React from "react"

import { useState } from "react"
import { X, Plus, Minus, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useInventory } from "@/components/inventory-provider"

interface StockMovementProps {
  onClose: () => void
  selectedProductId?: string | null
}

export function StockMovement({ onClose, selectedProductId }: StockMovementProps) {
  const { products, updateStock } = useInventory()
  const [selectedProduct, setSelectedProduct] = useState(selectedProductId || "")
  const [quantity, setQuantity] = useState(0)
  const [operation, setOperation] = useState<"add" | "subtract">("add")
  const [reason, setReason] = useState("")

  const product = products.find((p) => p.id === selectedProduct)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedProduct || quantity <= 0) {
      alert("Por favor selecciona un producto y una cantidad válida")
      return
    }

    updateStock(selectedProduct, quantity, operation)

    // Aquí podrías guardar el registro del movimiento en el futuro
    console.log("Movimiento registrado:", {
      productId: selectedProduct,
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
            <Package className="h-5 w-5" />
            Movimiento de Stock
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="product">Producto *</Label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un producto" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{product.name}</span>
                        <Badge variant="outline" className="ml-2">
                          {product.currentStock} {product.unit}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {product && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Stock actual:</div>
                <div className="text-lg font-semibold">
                  {product.currentStock} {product.unit}
                </div>
                <div className="text-sm text-gray-500">
                  Mínimo: {product.minStock} {product.unit}
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
                      Entrada (Agregar Stock)
                    </div>
                  </SelectItem>
                  <SelectItem value="subtract">
                    <div className="flex items-center gap-2">
                      <Minus className="h-4 w-4 text-red-600" />
                      Salida (Consumir Stock)
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
                min="0.01"
                step="0.01"
                required
              />
              {product && <div className="text-sm text-gray-500 mt-1">Unidad: {product.unit}</div>}
            </div>

            <div>
              <Label htmlFor="reason">Motivo (opcional)</Label>
              <Input
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ej: Compra, Venta, Merma, etc."
              />
            </div>

            {product && quantity > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-600">Resultado:</div>
                <div className="font-semibold">
                  {operation === "add"
                    ? `${product.currentStock} + ${quantity} = ${product.currentStock + quantity}`
                    : `${product.currentStock} - ${quantity} = ${Math.max(0, product.currentStock - quantity)}`}{" "}
                  {product.unit}
                </div>
                {operation === "subtract" && quantity > product.currentStock && (
                  <div className="text-sm text-red-600 mt-1">⚠️ La cantidad excede el stock disponible</div>
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
                    Agregar Stock
                  </>
                ) : (
                  <>
                    <Minus className="h-4 w-4 mr-2" />
                    Consumir Stock
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
