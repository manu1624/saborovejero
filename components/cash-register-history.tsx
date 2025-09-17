"use client"

import { useState } from "react"
import { Eye, Calendar, DollarSign, User, AlertTriangle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useInventory } from "@/components/inventory-provider"
import { CashRegisterDetails } from "@/components/cash-register-details"

export function CashRegisterHistory() {
  const { cashRegisters } = useInventory()
  const [selectedRegister, setSelectedRegister] = useState<string | null>(null)

  // Ordenar por fecha más reciente
  const sortedRegisters = [...cashRegisters].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  // Estadísticas
  const totalRegisters = cashRegisters.length
  const openRegisters = cashRegisters.filter((cr) => cr.status === "open").length
  const registersWithDifferences = cashRegisters.filter(
    (cr) => cr.status === "closed" && cr.difference && Math.abs(cr.difference) > 0,
  ).length

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-green-100 text-green-800">Abierta</Badge>
      case "closed":
        return <Badge className="bg-gray-100 text-gray-800">Cerrada</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getDifferenceIndicator = (difference?: number) => {
    if (!difference || difference === 0) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    return <AlertTriangle className={`h-4 w-4 ${difference > 0 ? "text-yellow-500" : "text-red-500"}`} />
  }

  if (sortedRegisters.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay historial</h3>
          <p className="text-gray-500">El historial de cajas registradoras aparecerá aquí</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas del historial */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registros</CardTitle>
            <Calendar className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRegisters}</div>
            <p className="text-xs opacity-80">cajas registradas</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cajas Abiertas</CardTitle>
            <DollarSign className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openRegisters}</div>
            <p className="text-xs opacity-80">actualmente activas</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Con Diferencias</CardTitle>
            <AlertTriangle className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{registersWithDifferences}</div>
            <p className="text-xs opacity-80">requieren atención</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de historial */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Cajas Registradoras</CardTitle>
          <CardDescription>Registro completo de todas las operaciones de caja</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Apertura</TableHead>
                <TableHead>Cierre</TableHead>
                <TableHead>Diferencia</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRegisters.map((register) => (
                <TableRow key={register.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{new Date(register.date).toLocaleDateString("es-CO")}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(register.openingTime).toLocaleTimeString("es-CO")}
                        {register.closingTime && <> - {new Date(register.closingTime).toLocaleTimeString("es-CO")}</>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium">{register.openedBy}</div>
                        {register.closedBy && register.closedBy !== register.openedBy && (
                          <div className="text-sm text-gray-500">Cerrada: {register.closedBy}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-green-600">${register.openingAmount.toLocaleString("es-CO")}</div>
                  </TableCell>
                  <TableCell>
                    {register.closingAmount !== undefined ? (
                      <div className="font-medium text-red-600">${register.closingAmount.toLocaleString("es-CO")}</div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getDifferenceIndicator(register.difference)}
                      {register.difference !== undefined ? (
                        <span
                          className={`font-medium ${
                            register.difference > 0
                              ? "text-green-600"
                              : register.difference < 0
                                ? "text-red-600"
                                : "text-gray-600"
                          }`}
                        >
                          {register.difference > 0 ? "+" : ""}${register.difference.toLocaleString("es-CO")}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(register.status)}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => setSelectedRegister(register.id)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalles
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de detalles */}
      {selectedRegister && (
        <CashRegisterDetails registerId={selectedRegister} onClose={() => setSelectedRegister(null)} />
      )}
    </div>
  )
}
