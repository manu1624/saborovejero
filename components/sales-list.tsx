"use client"

import { useState } from "react"
import { Eye, Calendar, DollarSign, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useInventory } from "@/components/inventory-provider"
import { SaleDetails } from "@/components/sale-details"

export function SalesList() {
  const { sales } = useInventory()
  const [selectedSale, setSelectedSale] = useState<string | null>(null)

  // Ordenar ventas por fecha más reciente
  const sortedSales = [...sales].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

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

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "efectivo":
        return "💵"
      case "transferencia":
        return "🏦"
      case "tarjeta":
        return "💳"
      case "nequi":
        return "📱"
      case "daviplata":
        return "📲"
      default:
        return "💰"
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Ventas Recientes
          </CardTitle>
          <CardDescription>Historial de todas las ventas registradas ({sales.length} ventas en total)</CardDescription>
        </CardHeader>
        <CardContent>
          {sales.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay ventas registradas</h3>
              <p className="text-gray-500">Las ventas aparecerán aquí una vez que registres la primera</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Productos</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Pago</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedSales.map((sale) => (
                    <TableRow key={sale.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="font-mono text-sm font-medium text-blue-600">{sale.saleNumber}</div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{new Date(sale.createdAt).toLocaleDateString("es-CO")}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(sale.createdAt).toLocaleTimeString("es-CO", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium">{sale.customerName || "Cliente General"}</div>
                            {sale.customerPhone && <div className="text-sm text-gray-500">{sale.customerPhone}</div>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {sale.items.length} producto{sale.items.length !== 1 ? "s" : ""}
                        </div>
                        <div className="text-xs text-gray-500">
                          {sale.items.reduce((sum, item) => sum + item.quantity, 0)} unidades
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-bold text-green-600">${sale.total.toLocaleString("es-CO")}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{getPaymentMethodIcon(sale.paymentMethod)}</span>
                          <span className="text-sm capitalize">{sale.paymentMethod}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(sale.status)}>{getStatusLabel(sale.status)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => setSelectedSale(sale.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de detalles de venta */}
      {selectedSale && <SaleDetails saleId={selectedSale} onClose={() => setSelectedSale(null)} />}
    </div>
  )
}
