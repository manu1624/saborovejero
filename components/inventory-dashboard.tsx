"use client"

import { useState } from "react"
import {
  Calculator,
  Receipt,
  ChefHat,
  Package,
  Wrench,
  Users,
  TrendingUp,
  AlertTriangle,
  Plus,
  Search,
  Filter,
} from "lucide-react"
import Image from "next/image"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/components/auth-provider"
import { useInventory } from "@/components/inventory-provider"

// Importar componentes de gestión
import { CashRegisterManagement } from "@/components/cash-register-management"
import { SalesManagement } from "@/components/sales-management"
import { MenuManagement } from "@/components/menu-management"
import { ProductList } from "@/components/product-list"
import { UtensilList } from "@/components/utensil-list"
import { UserManagement } from "@/components/user-management"

const productCategories = [
  "Pizzería",
  "Lasaña",
  "Ensaladas de frutas + helados",
  "Aromáticas / Cafés",
  "Micheladas / Cócteles",
]

const utensilCategories = ["Cocina", "Servicio", "Mobiliario", "Limpieza", "Equipos"]

export function InventoryDashboard() {
  const { user, canAccessModule, hasPermission, canViewPrices } = useAuth()
  const { products, utensils, sales, loading } = useInventory()

  // Estados para productos
  const [productSearchTerm, setProductSearchTerm] = useState("")
  const [selectedProductCategory, setSelectedProductCategory] = useState<string>("all")
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)

  // Estados para utensilios
  const [utensilSearchTerm, setUtensilSearchTerm] = useState("")
  const [selectedUtensilCategory, setSelectedUtensilCategory] = useState<string>("all")
  const [selectedUtensil, setSelectedUtensil] = useState<string | null>(null)

  const [activeTab, setActiveTab] = useState("products")

  const availableTabs = [
    { id: "cash", label: "Caja", icon: Calculator, module: "cash" },
    { id: "sales", label: "Ventas", icon: Receipt, module: "sales" },
    { id: "menu", label: "Menú", icon: ChefHat, module: "menu" },
    { id: "products", label: "Productos", icon: Package, module: "products" },
    { id: "utensils", label: "Utensilios", icon: Wrench, module: "utensils" },
    { id: "users", label: "Usuarios", icon: Users, module: "users" },
  ].filter((tab) => canAccessModule(tab.module))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Package className="h-12 w-12 animate-spin mx-auto mb-4 text-amber-600" />
          <p className="text-lg text-gray-600">Cargando datos...</p>
        </div>
      </div>
    )
  }

  // Filtros para productos
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(productSearchTerm.toLowerCase())
    const matchesCategory = selectedProductCategory === "all" || product.category === selectedProductCategory
    return matchesSearch && matchesCategory
  })

  // Filtros para utensilios
  const filteredUtensils = utensils.filter((utensil) => {
    const matchesSearch =
      utensil.name.toLowerCase().includes(utensilSearchTerm.toLowerCase()) ||
      utensil.code.toLowerCase().includes(utensilSearchTerm.toLowerCase())
    const matchesCategory = selectedUtensilCategory === "all" || utensil.category === selectedUtensilCategory
    return matchesSearch && matchesCategory
  })

  // Estadísticas para el dashboard
  const totalProducts = products.length
  const lowStockProducts = products.filter((p) => p.currentStock <= p.minStock).length
  const totalProductValue = canViewPrices() ? products.reduce((sum, p) => sum + p.currentStock * p.price, 0) : 0
  const outOfStockProducts = products.filter((p) => p.currentStock === 0).length

  const totalUtensils = utensils.reduce((sum, u) => sum + u.currentQuantity, 0)
  const lowQuantityUtensils = utensils.filter((u) => u.currentQuantity <= u.minQuantity).length
  const totalUtensilValue = canViewPrices()
    ? utensils.reduce((sum, u) => sum + u.currentQuantity * u.purchasePrice, 0)
    : 0

  // Estadísticas de ventas (hoy)
  const today = new Date().toISOString().slice(0, 10)
  const todaySales = sales.filter((s) => s.createdAt.slice(0, 10) === today && s.status === "completed")
  const todayRevenue = canViewPrices() ? todaySales.reduce((sum, s) => sum + s.total, 0) : 0
  const todayOrders = todaySales.length

  return (
    <div className="space-y-6">
      {/* Logo y título principal */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Image
            src="/logo-marulanda.png"
            alt="Pizzería Marulanda"
            width={80}
            height={80}
            className="rounded-lg shadow-md"
          />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sistema Integral Pizzería Marulanda</h1>
            <p className="text-gray-600">Inventario • Ventas • Control Total - Marulanda, Caldas</p>
          </div>
        </div>
      </div>

      {/* Resumen general - solo si tiene permisos para ver datos */}
      {(canAccessModule("sales") || canAccessModule("products") || canAccessModule("utensils")) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {canAccessModule("sales") && canViewPrices() && (
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ventas Hoy</CardTitle>
                <Receipt className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${todayRevenue.toLocaleString("es-CO")}</div>
                <p className="text-xs opacity-80">{todayOrders} pedidos completados</p>
              </CardContent>
            </Card>
          )}

          {canAccessModule("products") && (
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inventario</CardTitle>
                <Package className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                {canViewPrices() ? (
                  <>
                    <div className="text-2xl font-bold">${totalProductValue.toLocaleString("es-CO")}</div>
                    <p className="text-xs opacity-80">{totalProducts} productos</p>
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{totalProducts}</div>
                    <p className="text-xs opacity-80">productos registrados</p>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {canAccessModule("utensils") && canViewPrices() && (
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Equipos</CardTitle>
                <Wrench className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalUtensilValue.toLocaleString("es-CO")}</div>
                <p className="text-xs opacity-80">{totalUtensils} utensilios</p>
              </CardContent>
            </Card>
          )}

          {(canAccessModule("products") || canAccessModule("utensils")) && (
            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Alertas</CardTitle>
                <AlertTriangle className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{lowStockProducts + lowQuantityUtensils}</div>
                <p className="text-xs opacity-80">productos con stock bajo</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Tabs para alternar entre módulos */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList
          className="grid w-full bg-white border"
          style={{ gridTemplateColumns: `repeat(${availableTabs.length}, 1fr)` }}
        >
          {availableTabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Contenido de cada tab */}
        {canAccessModule("cash") && (
          <TabsContent value="cash" className="space-y-6">
            <CashRegisterManagement />
          </TabsContent>
        )}

        {canAccessModule("sales") && (
          <TabsContent value="sales" className="space-y-6">
            <SalesManagement />
          </TabsContent>
        )}

        {canAccessModule("menu") && (
          <TabsContent value="menu" className="space-y-6">
            <MenuManagement />
          </TabsContent>
        )}

        {canAccessModule("products") && (
          <TabsContent value="products" className="space-y-6">
            {/* Header de productos */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Gestión de Productos</h2>
                <p className="text-gray-600">
                  {user?.role === "cashier"
                    ? "Consulta disponibilidad de productos para ventas"
                    : "Administra el inventario de productos"}
                </p>
              </div>
              {hasPermission("products", "write") && (
                <div className="flex gap-2">
                  <Button variant="outline" className="bg-white hover:bg-gray-50">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Movimiento Stock
                  </Button>
                  <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Producto
                  </Button>
                </div>
              )}
            </div>

            {/* Stats Cards para productos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-white shadow-sm border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
                  <Package className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{totalProducts}</div>
                  <p className="text-xs text-gray-500">productos registrados</p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border-l-4 border-l-red-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{lowStockProducts}</div>
                  <p className="text-xs text-gray-500">productos con stock mínimo</p>
                </CardContent>
              </Card>

              {canViewPrices() && (
                <Card className="bg-white shadow-sm border-l-4 border-l-green-500">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      ${totalProductValue.toLocaleString("es-CO")}
                    </div>
                    <p className="text-xs text-gray-500">valor del inventario</p>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-white shadow-sm border-l-4 border-l-orange-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sin Stock</CardTitle>
                  <Package className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{outOfStockProducts}</div>
                  <p className="text-xs text-gray-500">productos agotados</p>
                </CardContent>
              </Card>
            </div>

            {/* Filtros para productos */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtros y Búsqueda - Productos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar por nombre o código..."
                        value={productSearchTerm}
                        onChange={(e) => setProductSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={selectedProductCategory} onValueChange={setSelectedProductCategory}>
                    <SelectTrigger className="w-full md:w-64">
                      <SelectValue placeholder="Filtrar por categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las categorías</SelectItem>
                      {productCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Lista de productos */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle>{user?.role === "cashier" ? "Consulta de Productos" : "Productos en Inventario"}</CardTitle>
                <CardDescription>
                  {filteredProducts.length} de {totalProducts} productos
                  {selectedProductCategory !== "all" && ` en ${selectedProductCategory}`}
                  {productSearchTerm && ` que coinciden con "${productSearchTerm}"`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProductList products={filteredProducts} onSelectProduct={setSelectedProduct} />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {canAccessModule("utensils") && (
          <TabsContent value="utensils" className="space-y-6">
            {/* Header de utensilios */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Gestión de Utensilios</h2>
                <p className="text-gray-600">Administra equipos y utensilios de la pizzería</p>
              </div>
              {hasPermission("utensils", "write") && (
                <div className="flex gap-2">
                  <Button variant="outline" className="bg-white hover:bg-gray-50">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Movimiento Utensilios
                  </Button>
                  <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Utensilio
                  </Button>
                </div>
              )}
            </div>

            {/* Filtros para utensilios */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtros y Búsqueda - Utensilios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar por nombre o código..."
                        value={utensilSearchTerm}
                        onChange={(e) => setUtensilSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={selectedUtensilCategory} onValueChange={setSelectedUtensilCategory}>
                    <SelectTrigger className="w-full md:w-64">
                      <SelectValue placeholder="Filtrar por categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las categorías</SelectItem>
                      {utensilCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Lista de utensilios */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Utensilios y Equipos</CardTitle>
                <CardDescription>
                  {filteredUtensils.length} de {utensils.length} utensilios
                  {selectedUtensilCategory !== "all" && ` en ${selectedUtensilCategory}`}
                  {utensilSearchTerm && ` que coinciden con "${utensilSearchTerm}"`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UtensilList utensils={filteredUtensils} onSelectUtensil={setSelectedUtensil} />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {canAccessModule("users") && (
          <TabsContent value="users" className="space-y-6">
            <UserManagement />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
