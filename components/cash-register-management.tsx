"use client"

import { useState } from "react"
import { Plus, Calculator, DollarSign, TrendingUp, AlertCircle, Clock, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useInventory } from "@/components/inventory-provider"
import { CashRegisterForm } from "@/components/cash-register-form"
import { CashMovementForm } from "@/components/cash-movement-form"
import { CashRegisterHistory } from "@/components/cash-register-history"
import { DailyReportsManager } from "@/components/daily-reports-manager"

export function CashRegisterManagement() {
  const { currentCashRegister, cashRegisters, getCashMovements, sales } = useInventory()
  const [showOpenForm, setShowOpenForm] = useState(false)
  const [showCloseForm, setShowCloseForm] = useState(false)
  const [showMovementForm, setShowMovementForm] = useState(false)

  // Calcular estadísticas del día actual
  const today = new Date().toISOString().slice(0, 10)
  const todaySales = sales.filter((s) => s.createdAt.slice(0, 10) === today && s.status === "completed")
  const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0)

  // Calcular balance actual de caja
  const currentBalance = currentCashRegister
    ? getCashMovements(currentCashRegister.id).reduce((total, movement) => {
        switch (movement.type) {
          case "income":
          case "deposit":
            return total + movement.amount
          case "expense":
          case "withdrawal":
            return total - movement.amount
          default:
            return total
        }
      }, 0)
    : 0

  // Estadísticas generales
  const totalRegisters = cashRegisters.length
  const openRegisters = cashRegisters.filter((cr) => cr.status === "open").length
  const closedToday = cashRegisters.filter((cr) => cr.date === today && cr.status === "closed").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Control de Caja</h2>
          <p className="text-gray-600">Gestión completa de apertura, cierre y movimientos de caja</p>
        </div>
        <div className="flex gap-2">
          {!currentCashRegister ? (
            <Button onClick={() => setShowOpenForm(true)} className="bg-green-600 hover:bg-green-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Abrir Caja
            </Button>
          ) : (
            <>
              <Button onClick={() => setShowMovementForm(true)} variant="outline" className="bg-white hover:bg-gray-50">
                <TrendingUp className="h-4 w-4 mr-2" />
                Movimiento
              </Button>
              <Button onClick={() => setShowCloseForm(true)} className="bg-red-600 hover:bg-red-700 text-white">
                <Calculator className="h-4 w-4 mr-2" />
                Cerrar Caja
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Estado actual de la caja */}
      <Card
        className={`border-l-4 ${currentCashRegister ? "border-l-green-500 bg-green-50" : "border-l-red-500 bg-red-50"}`}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Estado Actual de Caja
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentCashRegister ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-600">Apertura</div>
                <div className="text-lg font-bold text-green-600">
                  ${currentCashRegister.openingAmount.toLocaleString("es-CO")}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(currentCashRegister.openingTime).toLocaleTimeString("es-CO")}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Balance Actual</div>
                <div className="text-lg font-bold text-blue-600">${currentBalance.toLocaleString("es-CO")}</div>
                <div className="text-xs text-gray-500">calculado automáticamente</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Ventas del Día</div>
                <div className="text-lg font-bold text-purple-600">${todayRevenue.toLocaleString("es-CO")}</div>
                <div className="text-xs text-gray-500">{todaySales.length} transacciones</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Responsable</div>
                <div className="text-lg font-bold text-gray-900">{currentCashRegister.openedBy}</div>
                <Badge className="bg-green-100 text-green-800">Caja Abierta</Badge>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Caja Cerrada</h3>
              <p className="text-gray-500 mb-4">No hay una caja registradora abierta actualmente</p>
              <Button onClick={() => setShowOpenForm(true)} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Abrir Caja para Comenzar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Hoy</CardTitle>
            <DollarSign className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${todayRevenue.toLocaleString("es-CO")}</div>
            <p className="text-xs opacity-80">{todaySales.length} transacciones</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance Actual</CardTitle>
            <Calculator className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${currentBalance.toLocaleString("es-CO")}</div>
            <p className="text-xs opacity-80">en caja registradora</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cajas Registradas</CardTitle>
            <Clock className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRegisters}</div>
            <p className="text-xs opacity-80">{openRegisters} abiertas</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cerradas Hoy</CardTitle>
            <TrendingUp className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{closedToday}</div>
            <p className="text-xs opacity-80">cajas procesadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para diferentes secciones */}
      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white border">
          <TabsTrigger value="current" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Caja Actual
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Historial
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Reportes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6">
          {currentCashRegister ? (
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Movimientos de Caja Actual</CardTitle>
                <CardDescription>
                  Registro de todos los movimientos de la caja abierta el{" "}
                  {new Date(currentCashRegister.openingTime).toLocaleDateString("es-CO")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CashMovementsList cashRegisterId={currentCashRegister.id} />
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white shadow-sm">
              <CardContent className="text-center py-12">
                <Calculator className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay caja abierta</h3>
                <p className="text-gray-500">Abre una caja registradora para ver los movimientos</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <CashRegisterHistory />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <DailyReportsManager />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {showOpenForm && <CashRegisterForm type="open" onClose={() => setShowOpenForm(false)} />}
      {showCloseForm && currentCashRegister && (
        <CashRegisterForm
          type="close"
          cashRegister={currentCashRegister}
          expectedAmount={currentBalance}
          onClose={() => setShowCloseForm(false)}
        />
      )}
      {showMovementForm && currentCashRegister && (
        <CashMovementForm cashRegisterId={currentCashRegister.id} onClose={() => setShowMovementForm(false)} />
      )}
    </div>
  )
}

// Componente para mostrar movimientos de caja
function CashMovementsList({ cashRegisterId }: { cashRegisterId: string }) {
  const { getCashMovements } = useInventory()
  const movements = getCashMovements(cashRegisterId)

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "income":
        return "💰"
      case "expense":
        return "💸"
      case "deposit":
        return "⬇️"
      case "withdrawal":
        return "⬆️"
      default:
        return "💱"
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

  if (movements.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No hay movimientos registrados</p>
        <p className="text-sm">Los movimientos aparecerán aquí conforme se registren</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {movements.map((movement) => (
        <div key={movement.id} className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            <span className="text-lg">{getMovementIcon(movement.type)}</span>
            <div>
              <div className="font-medium text-gray-900">{movement.description}</div>
              <div className="text-sm text-gray-500">
                {movement.category} • {new Date(movement.createdAt).toLocaleTimeString("es-CO")}
              </div>
            </div>
          </div>
          <div className={`font-bold ${getMovementColor(movement.type)}`}>
            {movement.type === "expense" || movement.type === "withdrawal" ? "-" : "+"}$
            {movement.amount.toLocaleString("es-CO")}
          </div>
        </div>
      ))}
    </div>
  )
}
