"use client"

import { useState } from "react"
import { Plus, Edit, Trash2, ChefHat, Clock, DollarSign, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useInventory } from "@/components/inventory-provider"
import { MenuItemForm } from "@/components/menu-item-form"

export function MenuManagement() {
  const { menuItems, products, deleteMenuItem } = useInventory()
  const [showMenuItemForm, setShowMenuItemForm] = useState(false)
  const [editingMenuItem, setEditingMenuItem] = useState<string | null>(null)

  const handleDelete = (menuItemId: string, menuItemName: string) => {
    if (confirm(`¿Estás seguro de que quieres eliminar "${menuItemName}" del menú?`)) {
      deleteMenuItem(menuItemId)
    }
  }

  const calculateIngredientCost = (menuItemId: string) => {
    const menuItem = menuItems.find((m) => m.id === menuItemId)
    if (!menuItem) return 0

    return menuItem.recipe.reduce((total, ingredient) => {
      const product = products.find((p) => p.id === ingredient.productId)
      if (!product) return total
      return total + ingredient.quantity * product.price
    }, 0)
  }

  const calculateMargin = (menuItemId: string) => {
    const menuItem = menuItems.find((m) => m.id === menuItemId)
    if (!menuItem) return 0

    const cost = calculateIngredientCost(menuItemId)
    const margin = ((menuItem.price - cost) / menuItem.price) * 100
    return margin
  }

  const canMakeItem = (menuItemId: string) => {
    const menuItem = menuItems.find((m) => m.id === menuItemId)
    if (!menuItem) return false

    return menuItem.recipe.every((ingredient) => {
      const product = products.find((p) => p.id === ingredient.productId)
      return product && product.currentStock >= ingredient.quantity
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión del Menú</h2>
          <p className="text-gray-600">Administra los productos de tu carta y sus recetas</p>
        </div>
        <Button onClick={() => setShowMenuItemForm(true)} className="bg-amber-600 hover:bg-amber-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Producto del Menú
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white shadow-sm border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <ChefHat className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{menuItems.length}</div>
            <p className="text-xs text-gray-500">productos en el menú</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponibles</CardTitle>
            <Package className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {menuItems.filter((item) => item.isAvailable && canMakeItem(item.id)).length}
            </div>
            <p className="text-xs text-gray-500">con ingredientes suficientes</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sin Stock</CardTitle>
            <Package className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {menuItems.filter((item) => !canMakeItem(item.id)).length}
            </div>
            <p className="text-xs text-gray-500">sin ingredientes suficientes</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precio Promedio</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              $
              {menuItems.length > 0
                ? Math.round(menuItems.reduce((sum, item) => sum + item.price, 0) / menuItems.length).toLocaleString(
                    "es-CO",
                  )
                : 0}
            </div>
            <p className="text-xs text-gray-500">precio promedio del menú</p>
          </CardContent>
        </Card>
      </div>

      {/* Menu Items Table */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Productos del Menú</CardTitle>
          <CardDescription>Gestiona los productos de tu carta, precios y recetas</CardDescription>
        </CardHeader>
        <CardContent>
          {menuItems.length === 0 ? (
            <div className="text-center py-12">
              <ChefHat className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay productos en el menú</h3>
              <p className="text-gray-500 mb-4">Comienza agregando productos a tu carta</p>
              <Button onClick={() => setShowMenuItemForm(true)} className="bg-amber-600 hover:bg-amber-700">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Primer Producto
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Costo Ingredientes</TableHead>
                    <TableHead>Margen</TableHead>
                    <TableHead>Tiempo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {menuItems.map((item) => {
                    const ingredientCost = calculateIngredientCost(item.id)
                    const margin = calculateMargin(item.id)
                    const canMake = canMakeItem(item.id)

                    return (
                      <TableRow key={item.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-500">{item.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">${item.price.toLocaleString("es-CO")}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">${ingredientCost.toLocaleString("es-CO")}</div>
                        </TableCell>
                        <TableCell>
                          <div
                            className={`font-medium ${margin > 50 ? "text-green-600" : margin > 30 ? "text-yellow-600" : "text-red-600"}`}
                          >
                            {margin.toFixed(1)}%
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-sm">{item.preparationTime} min</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge
                              className={item.isAvailable ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                            >
                              {item.isAvailable ? "Activo" : "Inactivo"}
                            </Badge>
                            <Badge className={canMake ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"}>
                              {canMake ? "Disponible" : "Sin Stock"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setEditingMenuItem(item.id)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(item.id, item.name)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {(showMenuItemForm || editingMenuItem) && (
        <MenuItemForm
          onClose={() => {
            setShowMenuItemForm(false)
            setEditingMenuItem(null)
          }}
          menuItemId={editingMenuItem}
        />
      )}
    </div>
  )
}
