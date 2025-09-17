"use client"

import { useState } from "react"
import { Plus, Receipt, TrendingUp, DollarSign, ShoppingBag, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useInventory } from "@/components/inventory-provider"
import { SaleForm } from "@/components/sale-form"
import { SalesList } from "@/components/sales-list"
import { SalesReports } from "@/components/sales-reports"

export function SalesManagement() {
  const { sales, menuItems, products } = useInventory()
  const [showSaleForm, setShowSaleForm] = useState(false)

  // Estadísticas generales
  const today = new Date().toISOString().slice(0, 10)
  const todaySales = sales.filter((s) => s.createdAt.slice(0, 10) === today && s.status === "completed")
  const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0)
  const todayOrders = todaySales.length

  const thisWeek = new Date()
  thisWeek.setDate(thisWeek.getDate() - 7)
  const weekSales = sales.filter((s) => new Date(s.createdAt) >= thisWeek && s.status === "completed")
  const weekRevenue = weekSales.reduce((sum, s) => sum + s.total, 0)

  const thisMonth = new Date()
  thisMonth.setDate(1)
  const monthSales = sales.filter((s) => new Date(s.createdAt) >= thisMonth && s.status === "completed")
  const monthRevenue = monthSales.reduce((sum, s) => sum + s.total, 0)

  const averageOrderValue = todayOrders > 0 ? todayRevenue / todayOrders : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Control de Ventas</h2>
          <p className="text-gray-600">Registra ventas y controla el impacto en tu inventario</p>
        </div>
        <Button onClick={() => setShowSaleForm(true)} className="bg-green-600 hover:bg-green-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Venta
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Hoy</CardTitle>
            <DollarSign className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${todayRevenue.toLocaleString("es-CO")}</div>
            <p className="text-xs opacity-80">{todayOrders} pedidos completados</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
            <Calendar className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${weekRevenue.toLocaleString("es-CO")}</div>
            <p className="text-xs opacity-80">{weekSales.length} pedidos</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Este Mes</CardTitle>
            <TrendingUp className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${monthRevenue.toLocaleString("es-CO")}</div>
            <p className="text-xs opacity-80">{monthSales.length} pedidos</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
            <ShoppingBag className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${averageOrderValue.toLocaleString("es-CO")}</div>
            <p className="text-xs opacity-80">valor promedio por pedido</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para ventas */}
      <Tabs defaultValue="new-sales" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white border">
          <TabsTrigger value="new-sales" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Ventas Recientes
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Reportes
          </TabsTrigger>
          <TabsTrigger value="menu-status" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Estado del Menú
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new-sales" className="space-y-6">
          <SalesList />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <SalesReports />
        </TabsContent>

        <TabsContent value="menu-status" className="space-y-6">
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Estado Actual del Menú</CardTitle>
              <CardDescription>Disponibilidad de productos según stock de ingredientes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {menuItems.map((item) => {
                  const canMake = item.recipe.every((ingredient) => {
                    const product = products.find((p) => p.id === ingredient.productId)
                    return product && product.currentStock >= ingredient.quantity
                  })

                  return (
                    <Card key={item.id} className={`border-l-4 ${canMake ? "border-l-green-500" : "border-l-red-500"}`}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <span className="text-lg font-bold text-green-600">
                            ${item.price.toLocaleString("es-CO")}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                        <div className="flex justify-between items-center">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${canMake ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                          >
                            {canMake ? "Disponible" : "Sin Stock"}
                          </span>
                          <span className="text-xs text-gray-500">{item.preparationTime} min</span>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de nueva venta */}
      {showSaleForm && <SaleForm onClose={() => setShowSaleForm(false)} />}
    </div>
  )
}
