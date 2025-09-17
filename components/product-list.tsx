"use client"

import { useState } from "react"
import { Package, AlertTriangle, Edit, Trash2, Eye, Hash, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/components/auth-provider"
import { useInventory, type Product } from "@/components/inventory-provider"

interface ProductListProps {
  products: Product[]
  onSelectProduct?: (productId: string) => void
}

export function ProductList({ products, onSelectProduct }: ProductListProps) {
  const { user, hasPermission, canViewPrices } = useAuth()
  const { deleteProduct } = useInventory()
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  // Filtrar productos
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  // Obtener categorías únicas
  const categories = Array.from(new Set(products.map((p) => p.category)))

  const getStockStatus = (product: Product) => {
    if (product.currentStock === 0) {
      return {
        status: "out",
        color: "bg-red-100 text-red-800 border-red-300",
        text: "SIN STOCK",
        alert: "🚨 NO DISPONIBLE",
      }
    } else if (product.currentStock <= product.minStock) {
      return {
        status: "low",
        color: "bg-yellow-100 text-yellow-800 border-yellow-300",
        text: "STOCK BAJO",
        alert: "⚠️ REABASTECER",
      }
    } else {
      return {
        status: "good",
        color: "bg-green-100 text-green-800 border-green-300",
        text: "DISPONIBLE",
        alert: "✅ EN STOCK",
      }
    }
  }

  const handleProductClick = (productId: string) => {
    setSelectedProduct(productId)
    onSelectProduct?.(productId)
  }

  const handleDelete = (productId: string, productName: string) => {
    if (confirm(`¿Estás seguro de que quieres eliminar "${productName}"?`)) {
      deleteProduct(productId)
    }
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay productos</h3>
        <p className="text-gray-500">No se encontraron productos con los filtros aplicados</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtros y búsqueda */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar por nombre o código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-64">
            <SelectValue placeholder="Filtrar por categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lista de productos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => {
          const stockStatus = getStockStatus(product)
          const isSelected = selectedProduct === product.id

          return (
            <Card
              key={product.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? "ring-2 ring-amber-500 shadow-md" : ""
              } ${stockStatus.status === "out" ? "opacity-90" : ""}`}
              onClick={() => handleProductClick(product.id)}
            >
              <CardContent className="p-4">
                {/* Header del producto */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                      <Hash className="h-3 w-3" />
                      <span className="font-mono">{product.code}</span>
                    </div>
                    <p className="text-xs text-gray-400">{product.category}</p>
                  </div>
                  <Badge className={stockStatus.color}>{stockStatus.text}</Badge>
                </div>

                {/* Información de stock - SIEMPRE VISIBLE */}
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Stock Actual:</span>
                    <span
                      className={`font-medium ${
                        product.currentStock === 0
                          ? "text-red-600"
                          : product.currentStock <= product.minStock
                            ? "text-yellow-600"
                            : "text-green-600"
                      }`}
                    >
                      {product.currentStock} {product.unit}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Stock Mínimo:</span>
                    <span className="text-sm text-gray-900">
                      {product.minStock} {product.unit}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Stock Máximo:</span>
                    <span className="text-sm text-gray-900">
                      {product.maxStock} {product.unit}
                    </span>
                  </div>
                </div>

                {/* Información de precios - SOLO PARA PROPIETARIO */}
                {canViewPrices() && (
                  <div className="space-y-2 mb-3 pt-3 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Precio Venta:</span>
                      <span className="font-medium text-green-600">${(product.price ?? 0).toLocaleString("es-CO")}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Costo:</span>
                      <span className="text-sm text-gray-900">${(product.cost ?? 0).toLocaleString("es-CO")}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Valor Total:</span>
                      <span className="text-sm font-medium text-blue-600">
                        ${((product.currentStock || 0) * (product.price ?? 0)).toLocaleString("es-CO")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Margen:</span>
                      <span className="text-sm font-medium text-purple-600">
                        {product.cost && product.cost > 0 && product.price != null
                          ? ((((product.price ?? 0) - (product.cost ?? 0)) / (product.cost ?? 1)) * 100).toFixed(1)
                          : 0}%
                      </span>
                    </div>
                  </div>
                )}

                {/* Alerta especial para cajeros */}
                {user?.role === "cashier" && product.currentStock <= product.minStock && (
                  <div
                    className={`flex items-center gap-2 p-2 rounded-md mb-3 ${
                      product.currentStock === 0
                        ? "bg-red-50 border border-red-200"
                        : "bg-yellow-50 border border-yellow-200"
                    }`}
                  >
                    <AlertTriangle
                      className={`h-4 w-4 ${product.currentStock === 0 ? "text-red-500" : "text-yellow-500"}`}
                    />
                    <span
                      className={`text-xs font-medium ${
                        product.currentStock === 0 ? "text-red-700" : "text-yellow-700"
                      }`}
                    >
                      {stockStatus.alert}
                    </span>
                  </div>
                )}

                {/* Información adicional */}
                <div className="text-xs text-gray-500 space-y-1 mb-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>Ubicación: {product.location}</span>
                  </div>
                  <div>Proveedor: {product.supplier}</div>
                  {product.expirationDate && (
                    <div>Vence: {new Date(product.expirationDate).toLocaleDateString("es-CO")}</div>
                  )}
                </div>

                {/* Acciones - SOLO PARA PROPIETARIO */}
                {user?.role === "owner" && hasPermission("products", "write") && (
                  <div className="flex gap-2 pt-3 border-t">
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                      <Eye className="h-3 w-3 mr-1" />
                      Ver
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 bg-transparent"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(product.id, product.name)
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                {/* Vista de solo lectura para cajeros */}
                {user?.role === "cashier" && (
                  <div className="pt-3 border-t">
                    <div className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
                      <Eye className="h-3 w-3" />
                      Solo consulta - Información para ventas
                    </div>
                  </div>
                )}

                {/* Indicador de disponibilidad para cajeros */}
                {user?.role === "cashier" && (
                  <div className="mt-2">
                    {product.currentStock > 0 ? (
                      <div className="text-xs text-green-700 bg-green-50 p-2 rounded text-center">
                        ✅ Disponible para venta ({product.currentStock} {product.unit})
                      </div>
                    ) : (
                      <div className="text-xs text-red-700 bg-red-50 p-2 rounded text-center">
                        ❌ NO disponible para venta - Informar al propietario
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Resumen para cajeros */}
      {user?.role === "cashier" && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="text-sm text-blue-800">
              <div className="font-medium mb-2">📊 Resumen de productos:</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <div className="font-medium">Total productos:</div>
                  <div>{filteredProducts.length}</div>
                </div>
                <div>
                  <div className="font-medium text-green-700">Disponibles:</div>
                  <div>{filteredProducts.filter((p) => p.currentStock > p.minStock).length}</div>
                </div>
                <div>
                  <div className="font-medium text-yellow-700">Stock bajo:</div>
                  <div>{filteredProducts.filter((p) => p.currentStock > 0 && p.currentStock <= p.minStock).length}</div>
                </div>
                <div>
                  <div className="font-medium text-red-700">Sin stock:</div>
                  <div>{filteredProducts.filter((p) => p.currentStock === 0).length}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
