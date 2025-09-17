"use client"

import { useState } from "react"
import { TrendingUp, DollarSign, ShoppingBag, BarChart3, PieChart } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useInventory } from "@/components/inventory-provider"

export function SalesReports() {
  const { sales, menuItems, products } = useInventory()
  const [reportPeriod, setReportPeriod] = useState("today")

  // Filtrar ventas según el período seleccionado
  const getFilteredSales = () => {
    const now = new Date()
    const completedSales = sales.filter((s) => s.status === "completed")

    switch (reportPeriod) {
      case "today":
        const today = now.toISOString().slice(0, 10)
        return completedSales.filter((s) => s.createdAt.slice(0, 10) === today)

      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return completedSales.filter((s) => new Date(s.createdAt) >= weekAgo)

      case "month":
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        return completedSales.filter((s) => new Date(s.createdAt) >= monthStart)

      case "all":
      default:
        return completedSales
    }
  }

  const filteredSales = getFilteredSales()

  // Calcular estadísticas
  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.total, 0)
  const totalOrders = filteredSales.length
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  // Productos más vendidos
  const productSales = filteredSales.reduce(
    (acc, sale) => {
      sale.items.forEach((item) => {
        if (!acc[item.menuItemId]) {
          acc[item.menuItemId] = {
            name: item.menuItemName,
            quantity: 0,
            revenue: 0,
          }
        }
        acc[item.menuItemId].quantity += item.quantity
        acc[item.menuItemId].revenue += item.total
      })
      return acc
    },
    {} as Record<string, { name: string; quantity: number; revenue: number }>,
  )

  const topProducts = Object.entries(productSales)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10)

  // Ventas por categoría
  const categorySales = filteredSales.reduce(
    (acc, sale) => {
      sale.items.forEach((item) => {
        const menuItem = menuItems.find((m) => m.id === item.menuItemId)
        const category = menuItem?.category || "Sin categoría"

        if (!acc[category]) {
          acc[category] = {
            quantity: 0,
            revenue: 0,
          }
        }
        acc[category].quantity += item.quantity
        acc[category].revenue += item.total
      })
      return acc
    },
    {} as Record<string, { quantity: number; revenue: number }>,
  )

  const topCategories = Object.entries(categorySales)
    .map(([category, data]) => ({ category, ...data }))
    .sort((a, b) => b.revenue - a.revenue)

  // Calcular costos de ingredientes
  const calculateIngredientCosts = () => {
    let totalCosts = 0

    filteredSales.forEach((sale) => {
      sale.items.forEach((item) => {
        const menuItem = menuItems.find((m) => m.id === item.menuItemId)
        if (menuItem) {
          const itemCost = menuItem.recipe.reduce((cost, ingredient) => {
            const product = products.find((p) => p.id === ingredient.productId)
            return cost + (product ? ingredient.quantity * product.price * item.quantity : 0)
          }, 0)
          totalCosts += itemCost
        }
      })
    })

    return totalCosts
  }

  const totalCosts = calculateIngredientCosts()
  const grossProfit = totalRevenue - totalCosts
  const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0

  const getPeriodLabel = () => {
    switch (reportPeriod) {
      case "today":
        return "Hoy"
      case "week":
        return "Últimos 7 días"
      case "month":
        return "Este mes"
      case "all":
        return "Todos los tiempos"
      default:
        return ""
    }
  }

  return (
    <div className="space-y-6">
      {/* Selector de período */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reportes de Ventas</h2>
          <p className="text-gray-600">Análisis detallado de tu rendimiento comercial</p>
        </div>
        <Select value={reportPeriod} onValueChange={setReportPeriod}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Hoy</SelectItem>
            <SelectItem value="week">Últimos 7 días</SelectItem>
            <SelectItem value="month">Este mes</SelectItem>
            <SelectItem value="all">Todos los tiempos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
            <DollarSign className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString("es-CO")}</div>
            <p className="text-xs opacity-80">{getPeriodLabel()}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
            <ShoppingBag className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs opacity-80">pedidos completados</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
            <BarChart3 className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${averageOrderValue.toLocaleString("es-CO")}</div>
            <p className="text-xs opacity-80">valor promedio por pedido</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margen</CardTitle>
            <TrendingUp className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profitMargin.toFixed(1)}%</div>
            <p className="text-xs opacity-80">margen de ganancia</p>
          </CardContent>
        </Card>
      </div>

      {/* Análisis financiero detallado */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Análisis Financiero - {getPeriodLabel()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Ingresos</h4>
              <div className="text-2xl font-bold text-green-600">${totalRevenue.toLocaleString("es-CO")}</div>
              <p className="text-sm text-gray-500">Total de ventas</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Costos</h4>
              <div className="text-2xl font-bold text-red-600">${totalCosts.toLocaleString("es-CO")}</div>
              <p className="text-sm text-gray-500">Costo de ingredientes</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Ganancia Bruta</h4>
              <div className="text-2xl font-bold text-blue-600">${grossProfit.toLocaleString("es-CO")}</div>
              <p className="text-sm text-gray-500">Ingresos - Costos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productos más vendidos */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Productos Más Vendidos
            </CardTitle>
            <CardDescription>{getPeriodLabel()}</CardDescription>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No hay datos de ventas para este período</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Vendidos</TableHead>
                    <TableHead>Ingresos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((product, index) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{product.quantity} unidades</TableCell>
                      <TableCell className="font-medium text-green-600">
                        ${product.revenue.toLocaleString("es-CO")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Ventas por categoría */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Ventas por Categoría
            </CardTitle>
            <CardDescription>{getPeriodLabel()}</CardDescription>
          </CardHeader>
          <CardContent>
            {topCategories.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No hay datos de ventas para este período</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Productos</TableHead>
                    <TableHead>Ingresos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topCategories.map((category, index) => (
                    <TableRow key={category.category}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                          <span className="font-medium">{category.category}</span>
                        </div>
                      </TableCell>
                      <TableCell>{category.quantity} unidades</TableCell>
                      <TableCell className="font-medium text-green-600">
                        ${category.revenue.toLocaleString("es-CO")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
