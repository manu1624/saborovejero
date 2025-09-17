"use client"

import { X, Mail, DollarSign, TrendingUp, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useInventory } from "@/components/inventory-provider"

interface DailyReportPreviewProps {
  reportId: string
  onClose: () => void
}

export function DailyReportPreview({ reportId, onClose }: DailyReportPreviewProps) {
  const { dailyReports } = useInventory()

  const report = dailyReports.find((r) => r.id === reportId)

  if (!report) {
    return null
  }

  const date = new Date(report.date).toLocaleDateString("es-CO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const profitMargin = report.totalSales > 0 ? (report.netIncome / report.totalSales) * 100 : 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl bg-white max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Reporte Diario - {date}
            </CardTitle>
            <CardDescription>Pizzería Marulanda • Reporte automático del sistema</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Header del reporte */}
          <div className="text-center border-b pb-4">
            <h1 className="text-2xl font-bold text-gray-900">PIZZERÍA MARULANDA</h1>
            <p className="text-gray-600">NIT: 123456789-0 • Tel: (123) 456-7890</p>
            <p className="text-lg font-medium mt-2">Reporte Diario de Ventas</p>
            <p className="text-gray-500">{date}</p>
          </div>

          {/* Resumen financiero */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Apertura</span>
                </div>
                <div className="text-xl font-bold text-green-600">${report.openingAmount.toLocaleString("es-CO")}</div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingBag className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Ventas</span>
                </div>
                <div className="text-xl font-bold text-blue-600">${report.totalSales.toLocaleString("es-CO")}</div>
              </CardContent>
            </Card>

            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800">Gastos</span>
                </div>
                <div className="text-xl font-bold text-red-600">${report.totalExpenses.toLocaleString("es-CO")}</div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">Ganancia</span>
                </div>
                <div className="text-xl font-bold text-purple-600">${report.netIncome.toLocaleString("es-CO")}</div>
                <div className="text-xs text-purple-600">{profitMargin.toFixed(1)}% margen</div>
              </CardContent>
            </Card>
          </div>

          {/* Resumen de caja */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumen de Caja</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Apertura de caja:</span>
                    <span className="font-medium">${report.openingAmount.toLocaleString("es-CO")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total ventas:</span>
                    <span className="font-medium text-green-600">${report.totalSales.toLocaleString("es-CO")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total gastos:</span>
                    <span className="font-medium text-red-600">${report.totalExpenses.toLocaleString("es-CO")}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Cierre de caja:</span>
                    <span className="font-medium">${report.closingAmount.toLocaleString("es-CO")}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Ganancia neta:</span>
                    <span className="font-bold text-purple-600">${report.netIncome.toLocaleString("es-CO")}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ventas por categoría */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ventas por Categoría</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Ingresos</TableHead>
                    <TableHead>% del Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(report.salesByCategory).map(([category, data]: [string, any]) => {
                    const percentage = report.totalSales > 0 ? (data.revenue / report.totalSales) * 100 : 0
                    return (
                      <TableRow key={category}>
                        <TableCell className="font-medium">{category}</TableCell>
                        <TableCell>{data.quantity} unidades</TableCell>
                        <TableCell className="font-medium text-green-600">
                          ${data.revenue.toLocaleString("es-CO")}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{percentage.toFixed(1)}%</Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Productos más vendidos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Productos Más Vendidos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Ingresos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.topProducts.map((product: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Badge className="bg-blue-100 text-blue-800">#{index + 1}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.quantity} unidades</TableCell>
                      <TableCell className="font-medium text-green-600">
                        ${product.revenue.toLocaleString("es-CO")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Métodos de pago */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Métodos de Pago</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(report.paymentMethods).map(([method, amount]: [string, any]) => {
                  const percentage = report.totalSales > 0 ? (amount / report.totalSales) * 100 : 0
                  return (
                    <div key={method} className="p-3 border rounded-lg">
                      <div className="text-sm text-gray-600 capitalize">{method}</div>
                      <div className="font-bold text-lg">${amount.toLocaleString("es-CO")}</div>
                      <div className="text-xs text-gray-500">{percentage.toFixed(1)}% del total</div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Footer del reporte */}
          <div className="text-center text-sm text-gray-500 border-t pt-4">
            <p>Reporte generado automáticamente por el Sistema de Inventario</p>
            <p>Pizzería Marulanda • {new Date().toLocaleString("es-CO")}</p>
            <p className="mt-2">
              Estado:{" "}
              {report.status === "sent"
                ? "✅ Enviado por email"
                : report.status === "pending"
                  ? "⏳ Pendiente de envío"
                  : "❌ Error en envío"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
