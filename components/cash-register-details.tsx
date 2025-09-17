"use client"

import { X, DollarSign, TrendingUp, TrendingDown, Clock, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useInventory } from "@/components/inventory-provider"

interface CashRegisterDetailsProps {
  registerId: string
  onClose: () => void
}

export function CashRegisterDetails({ registerId, onClose }: CashRegisterDetailsProps) {
  const { cashRegisters, getCashMovements, sales } = useInventory()

  const register = cashRegisters.find((cr) => cr.id === registerId)
  const movements = getCashMovements(registerId)
  const registerSales = sales.filter((s) => s.createdAt.slice(0, 10) === register?.date && s.status === "completed")

  if (!register) {
    return null
  }

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "income":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "expense":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      case "deposit":
        return <TrendingUp className="h-4 w-4 text-blue-600" />
      case "withdrawal":
        return <TrendingDown className="h-4 w-4 text-orange-600" />
      default:
        return <DollarSign className="h-4 w-4 text-gray-600" />
    }
  }

  const getMovementColor = (type: string) => {
    switch (type) {
      case "income":
      case "deposit":
        return "text-green-600"
      case "expense":
      case "withdrawal":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const totalSales = registerSales.reduce((sum, s) => sum + s.total, 0)
  const totalExpenses = movements.filter((m) => m.type === "expense").reduce((sum, m) => sum + m.amount, 0)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl bg-white max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Detalles de Caja Registradora
            </CardTitle>
            <CardDescription>
              {new Date(register.date).toLocaleDateString("es-CO")} - {register.openedBy}
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Información general */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Apertura</span>
                </div>
                <div className="text-xl font-bold text-green-600">
                  ${register.openingAmount.toLocaleString("es-CO")}
                </div>
                <div className="text-xs text-green-600">
                  {new Date(register.openingTime).toLocaleTimeString("es-CO")}
                </div>
              </CardContent>
            </Card>

            {register.status === "closed" && (
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800">Cierre</span>
                  </div>
                  <div className="text-xl font-bold text-red-600">
                    ${(register.closingAmount || 0).toLocaleString("es-CO")}
                  </div>
                  <div className="text-xs text-red-600">
                    {register.closingTime && new Date(register.closingTime).toLocaleTimeString("es-CO")}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Ventas</span>
                </div>
                <div className="text-xl font-bold text-blue-600">${totalSales.toLocaleString("es-CO")}</div>
                <div className="text-xs text-blue-600">{registerSales.length} transacciones</div>
              </CardContent>
            </Card>

            {register.difference !== undefined && (
              <Card
                className={`${
                  register.difference > 0
                    ? "bg-yellow-50 border-yellow-200"
                    : register.difference < 0
                      ? "bg-red-50 border-red-200"
                      : "bg-gray-50 border-gray-200"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">Diferencia</span>
                  </div>
                  <div
                    className={`text-xl font-bold ${
                      register.difference > 0
                        ? "text-yellow-600"
                        : register.difference < 0
                          ? "text-red-600"
                          : "text-gray-600"
                    }`}
                  >
                    {register.difference > 0 ? "+" : ""}${register.difference.toLocaleString("es-CO")}
                  </div>
                  <div className="text-xs">
                    {register.difference > 0 ? "Sobrante" : register.difference < 0 ? "Faltante" : "Exacto"}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Estado y responsables */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información de la Sesión</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Abierta por:</span>
                    <span className="font-medium">{register.openedBy}</span>
                  </div>
                  {register.closedBy && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Cerrada por:</span>
                      <span className="font-medium">{register.closedBy}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Estado:</span>
                    <Badge
                      className={
                        register.status === "open" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }
                    >
                      {register.status === "open" ? "Abierta" : "Cerrada"}
                    </Badge>
                  </div>
                </div>
                {register.notes && (
                  <div>
                    <span className="text-sm text-gray-600">Notas:</span>
                    <p className="text-sm bg-gray-50 p-2 rounded mt-1">{register.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Movimientos de caja */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Movimientos de Caja</CardTitle>
              <CardDescription>Registro detallado de todos los movimientos durante esta sesión</CardDescription>
            </CardHeader>
            <CardContent>
              {movements.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No hay movimientos registrados</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hora</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movements.map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell>{new Date(movement.createdAt).toLocaleTimeString("es-CO")}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getMovementIcon(movement.type)}
                            <span className="capitalize">{movement.type}</span>
                          </div>
                        </TableCell>
                        <TableCell>{movement.description}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{movement.category}</Badge>
                        </TableCell>
                        <TableCell className={`text-right font-medium ${getMovementColor(movement.type)}`}>
                          {movement.type === "expense" || movement.type === "withdrawal" ? "-" : "+"}$
                          {movement.amount.toLocaleString("es-CO")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Ventas del día */}
          {registerSales.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ventas del Día</CardTitle>
                <CardDescription>
                  {registerSales.length} ventas por un total de ${totalSales.toLocaleString("es-CO")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hora</TableHead>
                      <TableHead>N° Venta</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Método Pago</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registerSales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>{new Date(sale.createdAt).toLocaleTimeString("es-CO")}</TableCell>
                        <TableCell className="font-mono text-sm">{sale.saleNumber}</TableCell>
                        <TableCell>{sale.customerName || "Cliente general"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {sale.paymentMethod}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          ${sale.total.toLocaleString("es-CO")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
