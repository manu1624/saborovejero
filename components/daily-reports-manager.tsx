"use client"

import { useState } from "react"
import { Mail, Download, Calendar, Send, Eye, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useInventory } from "@/components/inventory-provider"
import { DailyReportPreview } from "@/components/daily-report-preview"

export function DailyReportsManager() {
  const { dailyReports, generateDailyReport, sendDailyReport, cashRegisters } = useInventory()
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const [emailAddress, setEmailAddress] = useState("admin@pizzeriamarulanda.com")
  const [sendingReports, setSendingReports] = useState<Set<string>>(new Set())

  // Ordenar reportes por fecha más reciente
  const sortedReports = [...dailyReports].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Generar reporte para una fecha específica
  const handleGenerateReport = (date: string) => {
    const report = generateDailyReport(date)
    if (!report) {
      alert("No se puede generar el reporte. Asegúrate de que la caja esté cerrada para esa fecha.")
    }
  }

  // Enviar reporte por email
  const handleSendReport = async (reportId: string) => {
    if (!emailAddress.trim()) {
      alert("Por favor ingresa una dirección de email")
      return
    }

    setSendingReports((prev) => new Set([...prev, reportId]))

    try {
      const success = await sendDailyReport(reportId, emailAddress.trim())
      if (success) {
        alert("Reporte enviado exitosamente")
      } else {
        alert("Error enviando el reporte")
      }
    } catch (error) {
      alert("Error enviando el reporte")
    } finally {
      setSendingReports((prev) => {
        const newSet = new Set(prev)
        newSet.delete(reportId)
        return newSet
      })
    }
  }

  // Descargar reporte como texto
  const handleDownloadReport = (report: any) => {
    const reportText = generateReportText(report)
    const blob = new Blob([reportText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `reporte-diario-${report.date}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Generar texto del reporte
  const generateReportText = (report: any) => {
    const date = new Date(report.date).toLocaleDateString("es-CO")

    const text = `
PIZZERÍA MARULANDA
REPORTE DIARIO - ${date}
${"=".repeat(50)}

RESUMEN FINANCIERO:
- Apertura de caja: $${report.openingAmount.toLocaleString("es-CO")}
- Cierre de caja: $${report.closingAmount.toLocaleString("es-CO")}
- Total ventas: $${report.totalSales.toLocaleString("es-CO")}
- Total gastos: $${report.totalExpenses.toLocaleString("es-CO")}
- Ganancia neta: $${report.netIncome.toLocaleString("es-CO")}

VENTAS POR CATEGORÍA:
${Object.entries(report.salesByCategory)
  .map(
    ([category, data]: [string, any]) =>
      `- ${category}: ${data.quantity} unidades - $${data.revenue.toLocaleString("es-CO")}`,
  )
  .join("\n")}

PRODUCTOS MÁS VENDIDOS:
${report.topProducts
  .map(
    (product: any, index: number) =>
      `${index + 1}. ${product.name}: ${product.quantity} unidades - $${product.revenue.toLocaleString("es-CO")}`,
  )
  .join("\n")}

MÉTODOS DE PAGO:
${Object.entries(report.paymentMethods)
  .map(([method, amount]: [string, any]) => `- ${method}: $${amount.toLocaleString("es-CO")}`)
  .join("\n")}

Reporte generado automáticamente
${new Date().toLocaleString("es-CO")}
`
    return text
  }

  // Obtener cajas cerradas que no tienen reporte
  const closedRegistersWithoutReport = cashRegisters.filter(
    (cr) => cr.status === "closed" && !dailyReports.some((dr) => dr.date === cr.date),
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return <Badge className="bg-green-100 text-green-800">Enviado</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Error</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header con configuración de email */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reportes Diarios</h2>
          <p className="text-gray-600">Gestión y envío automático de reportes por email</p>
        </div>
        <Card className="w-80">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Configuración de Email</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="email">Dirección de envío</Label>
              <Input
                id="email"
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                placeholder="admin@pizzeriamarulanda.com"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas para reportes pendientes */}
      {closedRegistersWithoutReport.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertCircle className="h-5 w-5" />
              Reportes Pendientes
            </CardTitle>
            <CardDescription className="text-orange-700">
              Hay {closedRegistersWithoutReport.length} cajas cerradas sin reporte generado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {closedRegistersWithoutReport.map((register) => (
                <div key={register.id} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div>
                    <span className="font-medium">{new Date(register.date).toLocaleDateString("es-CO")}</span>
                    <span className="text-sm text-gray-500 ml-2">Cerrada por {register.closedBy}</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleGenerateReport(register.date)}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Generar Reporte
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reportes</CardTitle>
            <Calendar className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailyReports.length}</div>
            <p className="text-xs opacity-80">reportes generados</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enviados</CardTitle>
            <CheckCircle className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailyReports.filter((r) => r.status === "sent").length}</div>
            <p className="text-xs opacity-80">por email</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Mail className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailyReports.filter((r) => r.status === "pending").length}</div>
            <p className="text-xs opacity-80">sin enviar</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errores</CardTitle>
            <AlertCircle className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailyReports.filter((r) => r.status === "failed").length}</div>
            <p className="text-xs opacity-80">fallos de envío</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de reportes */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Reportes</CardTitle>
          <CardDescription>Todos los reportes diarios generados y su estado de envío</CardDescription>
        </CardHeader>
        <CardContent>
          {sortedReports.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay reportes</h3>
              <p className="text-gray-500">Los reportes diarios aparecerán aquí cuando se generen</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Ventas</TableHead>
                  <TableHead>Ganancia</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Enviado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div className="font-medium">{new Date(report.date).toLocaleDateString("es-CO")}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-green-600">${report.totalSales.toLocaleString("es-CO")}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-blue-600">${report.netIncome.toLocaleString("es-CO")}</div>
                    </TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell>
                      {report.emailSentAt ? (
                        <div className="text-sm text-gray-500">
                          {new Date(report.emailSentAt).toLocaleDateString("es-CO")}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setSelectedReportId(report.id)}>
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDownloadReport(report)}>
                          <Download className="h-4 w-4 mr-1" />
                          Descargar
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSendReport(report.id)}
                          disabled={sendingReports.has(report.id)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Send className="h-4 w-4 mr-1" />
                          {sendingReports.has(report.id) ? "Enviando..." : "Enviar"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal de vista previa */}
      {selectedReportId && <DailyReportPreview reportId={selectedReportId} onClose={() => setSelectedReportId(null)} />}
    </div>
  )
}
