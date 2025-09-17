"use client"

import { AlertTriangle, Package, X, Bell } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useInventory } from "@/components/inventory-provider"
import { useAuth } from "@/components/auth-provider"
import { useState } from "react"

interface StockAlertsProps {
  onClose?: () => void
  showAsModal?: boolean
}

export function StockAlerts({ onClose, showAsModal = false }: StockAlertsProps) {
  const { products } = useInventory()
  const { user } = useAuth()
  const [dismissed, setDismissed] = useState(false)

  // Solo mostrar alertas a cajeros
  if (!user || user.role !== "cashier" || dismissed) {
    return null
  }

  // Productos con stock bajo o agotados
  const lowStockProducts = products.filter((p) => p.currentStock <= p.minStock)
  const outOfStockProducts = products.filter((p) => p.currentStock === 0)
  const criticalStockProducts = lowStockProducts.filter((p) => p.currentStock > 0)

  if (lowStockProducts.length === 0) {
    return null
  }

  const handleDismiss = () => {
    setDismissed(true)
    onClose?.()
  }

  const AlertContent = () => (
    <div className="space-y-4">
      {/* Productos agotados - Crítico */}
      {outOfStockProducts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h3 className="font-semibold text-red-900">🚨 Productos Agotados ({outOfStockProducts.length})</h3>
          </div>
          <div className="space-y-2">
            {outOfStockProducts.slice(0, 5).map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-medium text-red-900">{product.name}</div>
                  <div className="text-sm text-red-700">
                    Código: {product.code} • {product.category}
                  </div>
                  <div className="text-xs text-red-600 font-medium">⚠️ NO DISPONIBLE PARA VENTA</div>
                </div>
                <Badge className="bg-red-100 text-red-800 border-red-300">SIN STOCK</Badge>
              </div>
            ))}
            {outOfStockProducts.length > 5 && (
              <div className="text-sm text-red-600 text-center p-2 bg-red-50 rounded">
                +{outOfStockProducts.length - 5} productos más sin stock
              </div>
            )}
          </div>
        </div>
      )}

      {/* Productos con stock bajo - Advertencia */}
      {criticalStockProducts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-900">⚠️ Stock Crítico ({criticalStockProducts.length})</h3>
          </div>
          <div className="space-y-2">
            {criticalStockProducts.slice(0, 5).map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-medium text-yellow-900">{product.name}</div>
                  <div className="text-sm text-yellow-700">
                    Código: {product.code} • {product.category}
                  </div>
                  <div className="text-sm text-yellow-600">
                    Quedan:{" "}
                    <strong>
                      {product.currentStock} {product.unit}
                    </strong>{" "}
                    • Mínimo: {product.minStock} {product.unit}
                  </div>
                  <div className="text-xs text-yellow-600 font-medium">🔔 Reabastecer pronto</div>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">STOCK BAJO</Badge>
              </div>
            ))}
            {criticalStockProducts.length > 5 && (
              <div className="text-sm text-yellow-600 text-center p-2 bg-yellow-50 rounded">
                +{criticalStockProducts.length - 5} productos más con stock bajo
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instrucciones para el cajero */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Bell className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <div className="font-medium mb-2">📋 Instrucciones importantes:</div>
            <ul className="space-y-1 text-xs">
              <li>
                • <strong>Productos sin stock:</strong> NO se pueden vender
              </li>
              <li>
                • <strong>Stock bajo:</strong> Informar al propietario para reabastecimiento
              </li>
              <li>
                • <strong>Verificar disponibilidad</strong> antes de confirmar pedidos
              </li>
              <li>
                • <strong>Sugerir alternativas</strong> si un producto no está disponible
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Resumen de alertas */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
        <div className="text-sm text-gray-700">
          <strong>Total de alertas:</strong> {lowStockProducts.length} productos requieren atención
        </div>
        <div className="flex gap-2">
          {outOfStockProducts.length > 0 && (
            <Badge className="bg-red-100 text-red-800">{outOfStockProducts.length} agotados</Badge>
          )}
          {criticalStockProducts.length > 0 && (
            <Badge className="bg-yellow-100 text-yellow-800">{criticalStockProducts.length} stock bajo</Badge>
          )}
        </div>
      </div>
    </div>
  )

  if (showAsModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Alertas de Stock - {user.fullName}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={handleDismiss}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <AlertContent />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Card className="border-orange-200 bg-orange-50 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-orange-900">
          <AlertTriangle className="h-5 w-5" />🔔 Alertas de Stock - {user.fullName}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={handleDismiss} className="text-orange-700 hover:text-orange-900">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <AlertContent />
      </CardContent>
    </Card>
  )
}
