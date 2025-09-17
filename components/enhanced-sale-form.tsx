"use client"

import type React from "react"

import { useState } from "react"
import { X, Save, Plus, Trash2, ShoppingCart, Calculator } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useInventory, type SaleItem } from "@/components/inventory-provider"
import { useEpsonTMT20III } from "./epson-tm-t20iii-driver"

interface EnhancedSaleFormProps {
  onClose: () => void
  posIntegration?: {
    isConnected: boolean
    openDrawer: () => Promise<boolean>
    printReceipt: (data: any) => Promise<boolean>
  }
}

const paymentMethods = [
  { value: "efectivo", label: "Efectivo" },
  { value: "transferencia", label: "Transferencia" },
  { value: "tarjeta", label: "Tarjeta" },
  { value: "nequi", label: "Nequi" },
  { value: "daviplata", label: "Daviplata" },
]

export function EnhancedSaleForm({ onClose, posIntegration }: EnhancedSaleFormProps) {
  const { menuItems, products, addSale, currentCashRegister, addCashMovement } = useInventory()
  const epsonPrinter = useEpsonTMT20III()

  const [saleItems, setSaleItems] = useState<SaleItem[]>([])
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [notes, setNotes] = useState("")

  // Nuevos estados para manejo de dinero
  const [receivedAmount, setReceivedAmount] = useState(0)
  const [showPaymentCalculator, setShowPaymentCalculator] = useState(false)

  const addSaleItem = () => {
    setSaleItems([...saleItems, { menuItemId: "", menuItemName: "", quantity: 1, unitPrice: 0, total: 0 }])
  }

  const removeSaleItem = (index: number) => {
    setSaleItems(saleItems.filter((_, i) => i !== index))
  }

  const updateSaleItem = (index: number, field: keyof SaleItem, value: string | number) => {
    const updatedItems = saleItems.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item, [field]: value }

        if (field === "menuItemId") {
          const menuItem = menuItems.find((m) => m.id === value)
          if (menuItem) {
            updatedItem.menuItemName = menuItem.name
            updatedItem.unitPrice = menuItem.price
            updatedItem.total = updatedItem.quantity * menuItem.price
          }
        }

        if (field === "quantity") {
          updatedItem.total = Number(value) * updatedItem.unitPrice
        }

        return updatedItem
      }
      return item
    })
    setSaleItems(updatedItems)
  }

  const canMakeItem = (menuItemId: string, quantity: number) => {
    const menuItem = menuItems.find((m) => m.id === menuItemId)
    if (!menuItem) return false

    return menuItem.recipe.every((ingredient) => {
      const product = products.find((p) => p.id === ingredient.productId)
      return product && product.currentStock >= ingredient.quantity * quantity
    })
  }

  const calculateSubtotal = () => {
    return saleItems.reduce((sum, item) => sum + item.total, 0)
  }

  const calculateTax = () => {
    return 0 // Por ahora sin impuestos
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  const calculateChange = () => {
    return Math.max(0, receivedAmount - calculateTotal())
  }

  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method)
    if (method === "efectivo") {
      setShowPaymentCalculator(true)
      setReceivedAmount(calculateTotal()) // Valor por defecto
    } else {
      setShowPaymentCalculator(false)
      setReceivedAmount(calculateTotal()) // Pago exacto para otros métodos
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (saleItems.length === 0) {
      alert("Por favor agrega al menos un producto a la venta")
      return
    }

    if (!paymentMethod) {
      alert("Por favor selecciona un método de pago")
      return
    }

    if (!currentCashRegister) {
      alert("No hay una caja registradora abierta")
      return
    }

    // Verificar disponibilidad de ingredientes
    for (const saleItem of saleItems) {
      if (!canMakeItem(saleItem.menuItemId, saleItem.quantity)) {
        const menuItem = menuItems.find((m) => m.id === saleItem.menuItemId)
        alert(`No hay suficientes ingredientes para preparar ${saleItem.quantity} ${menuItem?.name}`)
        return
      }
    }

    // Verificar pago en efectivo
    if (paymentMethod === "efectivo" && receivedAmount < calculateTotal()) {
      alert("El monto recibido es insuficiente")
      return
    }

    const total = calculateTotal()
    const change = calculateChange()
    const saleNumber = `PZM-${Date.now()}`

    const saleData = {
      items: saleItems,
      subtotal: calculateSubtotal(),
      tax: calculateTax(),
      total,
      paymentMethod,
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      notes: notes || undefined,
      status: "completed" as const,
    }

    try {
      // Registrar la venta
      addSale(saleData)

      // Agregar movimiento de caja (ingreso por venta)
      addCashMovement({
        cashRegisterId: currentCashRegister.id,
        type: "income",
        amount: total,
        description: `Venta #${saleNumber} - ${paymentMethod}`,
        category: "Ventas",
        relatedSaleId: saleNumber,
      })

      // Integración con Epson TM-T20III si está disponible
      if (epsonPrinter.isConnected) {
        try {
          // Preparar datos del recibo para Epson
          const receiptData = {
            saleNumber,
            cashier: currentCashRegister.openedBy,
            items: saleItems.map((item) => ({
              name: item.menuItemName,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.total,
              notes: notes,
            })),
            subtotal: calculateSubtotal(),
            tax: calculateTax(),
            total,
            received: receivedAmount,
            change,
            paymentMethod,
            customerName,
            customerPhone,
            generateQR: true, // Generar código QR con info de la venta
            timestamp: new Date().toISOString(),
          }

          // Imprimir recibo con Epson TM-T20III
          await epsonPrinter.printReceipt(receiptData)

          // Abrir cajón para efectivo
          if (paymentMethod === "efectivo") {
            await epsonPrinter.openDrawer()
          }
        } catch (epsonError) {
          console.error("Error con impresora Epson:", epsonError)
          alert("Venta registrada correctamente, pero hubo un problema con la impresora")
        }
      } else if (posIntegration?.isConnected) {
        // Fallback a integración POS genérica
        try {
          await posIntegration.printReceipt({
            cashier: currentCashRegister.openedBy,
            items: saleItems,
            subtotal: calculateSubtotal(),
            tax: calculateTax(),
            total,
            received: receivedAmount,
            change,
            paymentMethod,
            customerName,
            saleNumber,
          })

          if (paymentMethod === "efectivo" && posIntegration.openDrawer) {
            await posIntegration.openDrawer()
          }
        } catch (posError) {
          console.error("Error con POS:", posError)
        }
      }

      alert(`¡Venta registrada exitosamente! Número: ${saleNumber}`)
      onClose()
    } catch (error) {
      console.error("Error procesando venta:", error)
      alert("Error procesando la venta")
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-5xl bg-white max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Nueva Venta
            {epsonPrinter.isConnected && (
              <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">Epson TM-T20III</span>
            )}
            {posIntegration?.isConnected && !epsonPrinter.isConnected && (
              <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">POS Conectado</span>
            )}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información del cliente */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Información del Cliente (Opcional)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">Nombre del Cliente</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nombre completo"
                  />
                </div>
                <div>
                  <Label htmlFor="customerPhone">Teléfono</Label>
                  <Input
                    id="customerPhone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Número de teléfono"
                  />
                </div>
              </div>
            </div>

            {/* Productos de la venta */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Productos</h3>
                <Button type="button" onClick={addSaleItem} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Producto
                </Button>
              </div>

              {saleItems.map((saleItem, index) => {
                const canMake = canMakeItem(saleItem.menuItemId, saleItem.quantity)

                return (
                  <div
                    key={index}
                    className={`grid grid-cols-12 gap-2 items-end p-3 rounded-lg border ${!canMake && saleItem.menuItemId ? "border-red-200 bg-red-50" : "border-gray-200"}`}
                  >
                    <div className="col-span-5">
                      <Label>Producto del Menú</Label>
                      <Select
                        value={saleItem.menuItemId}
                        onValueChange={(value) => updateSaleItem(index, "menuItemId", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un producto" />
                        </SelectTrigger>
                        <SelectContent>
                          {menuItems
                            .filter((item) => item.isAvailable)
                            .map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name} - ${item.price.toLocaleString("es-CO")}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      {!canMake && saleItem.menuItemId && (
                        <p className="text-xs text-red-600 mt-1">⚠️ Sin ingredientes suficientes</p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <Label>Cantidad</Label>
                      <Input
                        type="number"
                        value={saleItem.quantity}
                        onChange={(e) => updateSaleItem(index, "quantity", Number(e.target.value))}
                        min="1"
                        placeholder="1"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Precio Unit.</Label>
                      <div className="text-sm font-medium text-gray-600 py-2">
                        ${saleItem.unitPrice.toLocaleString("es-CO")}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <Label>Total</Label>
                      <div className="text-sm font-bold text-green-600 py-2">
                        ${saleItem.total.toLocaleString("es-CO")}
                      </div>
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeSaleItem(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}

              {saleItems.length === 0 && (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                  <p>No hay productos agregados</p>
                  <p className="text-sm">Agrega productos del menú para crear la venta</p>
                </div>
              )}
            </div>

            {/* Método de pago y calculadora */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="paymentMethod">Método de Pago *</Label>
                  <Select value={paymentMethod} onValueChange={handlePaymentMethodChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona método de pago" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes">Notas Adicionales</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Observaciones, pedidos especiales..."
                    rows={2}
                  />
                </div>
              </div>

              {/* Calculadora de pago */}
              {showPaymentCalculator && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-900">
                      <Calculator className="h-5 w-5" />
                      Calculadora de Pago
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label htmlFor="receivedAmount">Dinero Recibido</Label>
                      <Input
                        id="receivedAmount"
                        type="number"
                        value={receivedAmount}
                        onChange={(e) => setReceivedAmount(Number(e.target.value))}
                        min="0"
                        step="100"
                        className="text-lg font-bold"
                      />
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total a pagar:</span>
                        <span className="font-bold">${calculateTotal().toLocaleString("es-CO")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Recibido:</span>
                        <span className="font-bold text-blue-600">${receivedAmount.toLocaleString("es-CO")}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span>Cambio:</span>
                        <span
                          className={`font-bold text-lg ${calculateChange() >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          ${calculateChange().toLocaleString("es-CO")}
                        </span>
                      </div>
                    </div>

                    {receivedAmount < calculateTotal() && (
                      <div className="text-red-600 text-sm font-medium">⚠️ Monto insuficiente</div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Resumen de la venta */}
            {saleItems.length > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <h4 className="font-medium text-gray-900">Resumen de la Venta</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span className="font-medium">${calculateSubtotal().toLocaleString("es-CO")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Impuestos:</span>
                    <span className="font-medium">${calculateTax().toLocaleString("es-CO")}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-green-600">${calculateTotal().toLocaleString("es-CO")}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={saleItems.length === 0 || (paymentMethod === "efectivo" && receivedAmount < calculateTotal())}
              >
                <Save className="h-4 w-4 mr-2" />
                {epsonPrinter.isConnected
                  ? "Procesar e Imprimir (Epson)"
                  : posIntegration?.isConnected
                    ? "Procesar y Imprimir"
                    : "Registrar Venta"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
