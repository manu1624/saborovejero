"use client"

import { X, Receipt, User, CreditCard, Calendar, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useInventory } from "@/components/inventory-provider"

interface SaleDetailsProps {
  saleId: string
  onClose: () => void
}

export function SaleDetails({ saleId, onClose }: SaleDetailsProps) {
  const { sales, menuItems } = useInventory()
  const sale = sales.find((s) => s.id === saleId)

  if (!sale) {
    return null
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Completada"
      case "pending":
        return "Pendiente"
      case "cancelled":
        return "Cancelada"
      default:
        return status
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Detalle de Venta #{sale.saleNumber}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Información general */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="font-medium">
                    {new Date(sale.createdAt).toLocaleDateString("es-CO", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                  <div className="text-sm text-gray-500">{new Date(sale.createdAt).toLocaleTimeString("es-CO")}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="font-medium">{sale.customerName || "Cliente General"}</div>
                  {sale.customerPhone && <div className="text-sm text-gray-500">{sale.customerPhone}</div>}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="font-medium capitalize">{sale.paymentMethod}</div>
                  <div className="text-sm text-gray-500">Método de pago</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-400" />
                <div>
                  <Badge className={getStatusColor(sale.status)}>{getStatusLabel(sale.status)}</Badge>
                  <div className="text-sm text-gray-500">Estado de la venta</div>
                </div>
              </div>
            </div>
          </div>

          {/* Productos vendidos */}
          <div>
            <h3 className="text-lg font-medium mb-3">Productos Vendidos</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Precio Unit.</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sale.items.map((item, index) => {
                  const menuItem = menuItems.find((m) => m.id === item.menuItemId)
                  return (
                    <TableRow key={index}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.menuItemName}</div>
                          {menuItem && <div className="text-sm text-gray-500">{menuItem.category}</div>}
                        </div>
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>${item.unitPrice.toLocaleString("es-CO")}</TableCell>
                      <TableCell className="font-medium">${item.total.toLocaleString("es-CO")}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {/* Resumen financiero */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <h3 className="font-medium text-gray-900">Resumen Financiero</h3>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span className="font-medium">${sale.subtotal.toLocaleString("es-CO")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Impuestos:</span>
                <span className="font-medium">${sale.tax.toLocaleString("es-CO")}</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-lg font-bold">
                <span>Total:</span>
                <span className="text-green-600">${sale.total.toLocaleString("es-CO")}</span>
              </div>
            </div>
          </div>

          {/* Notas adicionales */}
          {sale.notes && (
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Notas Adicionales</h3>
              <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">{sale.notes}</div>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={onClose} className="bg-amber-600 hover:bg-amber-700">
              Cerrar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
