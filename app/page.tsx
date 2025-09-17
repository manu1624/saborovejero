"use client"

import { AuthProvider, useAuth, ROLE_DESCRIPTIONS } from "@/components/auth-provider"
import { InventoryProvider } from "@/components/inventory-provider"
import { LoginForm } from "@/components/login-form"
import { StockAlerts } from "@/components/stock-alerts"
import { InventoryDashboard } from "@/components/inventory-dashboard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LogOut, Bell } from "lucide-react"

function AppContent() {
  const { user, logout, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-600">Cargando sistema...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  return (
    <InventoryProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header del sistema */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo y título */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-white">PM</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Pizzería Marulanda</h1>
                  <p className="text-sm text-gray-600">Sistema de Inventario y Ventas</p>
                </div>
              </div>

              {/* Información del usuario y acciones */}
              <div className="flex items-center gap-4">
                {/* Indicador de alertas para cajeros */}
                {user.role === "cashier" && (
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-orange-500" />
                    <span className="text-sm text-orange-600">Alertas activas</span>
                  </div>
                )}

                {/* Información del usuario */}
                <div className="text-right">
                  <div className="font-medium text-gray-900">{user.fullName}</div>
                  <div className="flex items-center gap-2">
                    <Badge className={ROLE_DESCRIPTIONS[user.role].color} variant="secondary">
                      {ROLE_DESCRIPTIONS[user.role].name}
                    </Badge>
                  </div>
                </div>

                {/* Botón de cerrar sesión */}
                <Button variant="outline" onClick={logout} size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  Salir
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Contenido principal */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Alertas de stock para cajeros */}
          {user.role === "cashier" && (
            <div className="mb-6">
              <StockAlerts />
            </div>
          )}

          {/* Dashboard principal */}
          <InventoryDashboard />
        </main>
      </div>
    </InventoryProvider>
  )
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
