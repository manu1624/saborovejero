"use client"

import { useState } from "react"

// Configuración específica para Epson TM-T20III
export const EPSON_TM_T20III_CONFIG = {
  vendorId: 0x04b8,
  productId: 0x0202,
  interface: "usb",
  encoding: "UTF-8",
  characterSet: "PC437_USA",
  maxLineWidth: 48, // caracteres por línea
  paperWidth: 80, // mm
  supportedFeatures: {
    cashDrawer: true,
    cutter: true,
    buzzer: true,
    barcode: true,
    qrCode: true,
    logo: true,
  },
}

// Comandos ESC/POS específicos para Epson TM-T20III
export const EPSON_COMMANDS = {
  // Inicialización
  INIT: "\x1B\x40",
  RESET: "\x1B\x40",

  // Control de papel
  CUT_FULL: "\x1D\x56\x00",
  CUT_PARTIAL: "\x1D\x56\x01",
  FEED_LINE: "\x0A",
  FEED_LINES: (n: number) => `\x1B\x64\x${n.toString(16).padStart(2, "0")}`,

  // Formato de texto
  BOLD_ON: "\x1B\x45\x01",
  BOLD_OFF: "\x1B\x45\x00",
  UNDERLINE_ON: "\x1B\x2D\x01",
  UNDERLINE_OFF: "\x1B\x2D\x00",
  DOUBLE_HEIGHT: "\x1B\x21\x10",
  DOUBLE_WIDTH: "\x1B\x21\x20",
  NORMAL_SIZE: "\x1B\x21\x00",

  // Alineación
  ALIGN_LEFT: "\x1B\x61\x00",
  ALIGN_CENTER: "\x1B\x61\x01",
  ALIGN_RIGHT: "\x1B\x61\x02",

  // Cajón de dinero
  OPEN_DRAWER_PIN2: "\x1B\x70\x00\x19\xFA", // Pin 2 (más común)
  OPEN_DRAWER_PIN5: "\x1B\x70\x01\x19\xFA", // Pin 5

  // Sonido
  BEEP: "\x1B\x42\x05\x05",
  BEEP_LONG: "\x1B\x42\x0A\x0A",

  // Códigos de barras
  BARCODE_HEIGHT: (h: number) => `\x1D\x68\x${h.toString(16).padStart(2, "0")}`,
  BARCODE_WIDTH: (w: number) => `\x1D\x77\x0${w}`,
  BARCODE_POSITION: "\x1D\x48\x02", // Debajo del código
  BARCODE_CODE128: "\x1D\x6B\x49",

  // QR Code
  QR_MODEL: "\x1D\x28\x6B\x04\x00\x31\x41\x32\x00",
  QR_SIZE: (size: number) => `\x1D\x28\x6B\x03\x00\x31\x43\x${size.toString(16).padStart(2, "0")}`,
  QR_ERROR_CORRECTION: "\x1D\x28\x6B\x03\x00\x31\x45\x30",
  QR_STORE: (data: string) => `\x1D\x28\x6B\x${(data.length + 3).toString(16).padStart(4, "0")}\x31\x50\x30${data}`,
  QR_PRINT: "\x1D\x28\x6B\x03\x00\x31\x51\x30",
}

interface EpsonTMT20IIIDriverProps {
  onConnectionChange?: (connected: boolean) => void
  onPrintComplete?: (success: boolean) => void
}

export function EpsonTMT20IIIDriver({ onConnectionChange, onPrintComplete }: EpsonTMT20IIIDriverProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [deviceInfo, setDeviceInfo] = useState<any>(null)
  const [settings, setSettings] = useState({
    autoOpenDrawer: true,
    autoCut: true,
    buzzerEnabled: true,
    printLogo: true,
    paperSaving: false,
    drawerPin: "pin2",
    characterSet: "PC437_USA",
    printDensity: "normal",
  })

  // Simular conexión USB (en producción usarías WebUSB API o Electron)
  const connectToDevice = async () => {
    setIsConnecting(true)

    try {
      // Simular detección del dispositivo
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // En producción, aquí usarías:
      // const device = await navigator.usb.requestDevice({
      //   filters: [{ vendorId: EPSON_TM_T20III_CONFIG.vendorId, productId: EPSON_TM_T20III_CONFIG.productId }]
      // });

      const mockDeviceInfo = {
        vendorId: EPSON_TM_T20III_CONFIG.vendorId,
        productId: EPSON_TM_T20III_CONFIG.productId,
        manufacturerName: "Seiko Epson Corporation",
        productName: "TM-T20III",
        serialNumber: "EPST20III001234",
        firmwareVersion: "1.2.3",
        interface: "USB",
        status: "Ready",
      }

      setDeviceInfo(mockDeviceInfo)
      setIsConnected(true)
      onConnectionChange?.(true)

      // Enviar comando de inicialización
      await sendCommand(EPSON_COMMANDS.INIT)
      await sendCommand(EPSON_COMMANDS.BEEP)
    } catch (error) {
      console.error("Error conectando a Epson TM-T20III:", error)
      setIsConnected(false)
      onConnectionChange?.(false)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectDevice = () => {
    setIsConnected(false)
    setDeviceInfo(null)
    onConnectionChange?.(false)
  }

  // Enviar comando a la impresora
  const sendCommand = async (command: string): Promise<boolean> => {
    if (!isConnected) {
      throw new Error("Impresora no conectada")
    }

    try {
      // En producción, aquí enviarías el comando real
      console.log("Enviando comando a Epson TM-T20III:", command)

      // Simular envío
      await new Promise((resolve) => setTimeout(resolve, 100))
      return true
    } catch (error) {
      console.error("Error enviando comando:", error)
      return false
    }
  }

  // Abrir cajón de dinero
  const openCashDrawer = async (): Promise<boolean> => {
    try {
      const drawerCommand = settings.drawerPin === "pin2" ? EPSON_COMMANDS.OPEN_DRAWER_PIN2 : EPSON_COMMANDS.OPEN_DRAWER_PIN5

      await sendCommand(drawerCommand)

      if (settings.buzzerEnabled) {
        await sendCommand(EPSON_COMMANDS.BEEP)
      }

      return true
    } catch (error) {
      console.error("Error abriendo cajón:", error)
      return false
    }
  }

  // Imprimir recibo completo
  const printReceipt = async (receiptData: any): Promise<boolean> => {
    try {
      let receipt = ""

      // Inicializar impresora
      receipt += EPSON_COMMANDS.INIT

      // Logo de la pizzería (si está habilitado)
      if (settings.printLogo) {
        receipt += EPSON_COMMANDS.ALIGN_CENTER
        receipt += EPSON_COMMANDS.DOUBLE_HEIGHT
        receipt += EPSON_COMMANDS.BOLD_ON
        receipt += "PIZZERÍA MARULANDA\n"
        receipt += EPSON_COMMANDS.NORMAL_SIZE
        receipt += EPSON_COMMANDS.BOLD_OFF
        receipt += "🍕 Auténtica Pizza Italiana 🍕\n"
        receipt += "NIT: 123.456.789-0\n"
        receipt += "Tel: (601) 234-5678\n"
        receipt += "Cra 15 #85-32, Bogotá\n"
        receipt += EPSON_COMMANDS.FEED_LINE
      }

      // Línea separadora
      receipt += EPSON_COMMANDS.ALIGN_LEFT
      receipt += "=".repeat(48) + "\n"

      // Información de la venta
      receipt += `RECIBO DE VENTA #${receiptData.saleNumber || "001"}\n`
      receipt += `Fecha: ${new Date().toLocaleDateString("es-CO")}\n`
      receipt += `Hora: ${new Date().toLocaleTimeString("es-CO")}\n`
      receipt += `Cajero: ${receiptData.cashier}\n`

      if (receiptData.customerName) {
        receipt += `Cliente: ${receiptData.customerName}\n`
      }

      receipt += "=".repeat(48) + "\n"

      // Items de la venta
      receipt += EPSON_COMMANDS.BOLD_ON
      receipt += "PRODUCTO                    CANT  PRECIO   TOTAL\n"
      receipt += EPSON_COMMANDS.BOLD_OFF
      receipt += "-".repeat(48) + "\n"

      receiptData.items.forEach((item: any) => {
        const name = item.name.substring(0, 23).padEnd(23)
        const qty = item.quantity.toString().padStart(4)
        const price = `$${item.unitPrice.toLocaleString("es-CO")}`.padStart(8)
        const total = `$${item.total.toLocaleString("es-CO")}`.padStart(8)

        receipt += `${name} ${qty} ${price} ${total}\n`

        // Agregar notas del producto si las hay
        if (item.notes) {
          receipt += `  * ${item.notes}\n`
        }
      })

      receipt += "-".repeat(48) + "\n"

      // Totales
      receipt += `Subtotal:${`$${receiptData.subtotal.toLocaleString("es-CO")}`.padStart(39)}\n`

      if (receiptData.tax > 0) {
        receipt += `IVA (19%):${`$${receiptData.tax.toLocaleString("es-CO")}`.padStart(38)}\n`
      }

      receipt += EPSON_COMMANDS.BOLD_ON
      receipt += `TOTAL:${`$${receiptData.total.toLocaleString("es-CO")}`.padStart(41)}\n`
      receipt += EPSON_COMMANDS.BOLD_OFF

      // Información de pago
      receipt += "=".repeat(48) + "\n"
      receipt += `Método de pago: ${receiptData.paymentMethod.toUpperCase()}\n`

      if (receiptData.paymentMethod === "efectivo") {
        receipt += `Recibido:${`$${receiptData.received.toLocaleString("es-CO")}`.padStart(38)}\n`
        receipt += `Cambio:${`$${receiptData.change.toLocaleString("es-CO")}`.padStart(40)}\n`
      }

      // Código QR con información de la venta (opcional)
      if (receiptData.generateQR) {
        receipt += EPSON_COMMANDS.ALIGN_CENTER
        receipt += EPSON_COMMANDS.FEED_LINE
        receipt += "Escanea para más información:\n"

        const qrData = `PIZZERIA_MARULANDA|${receiptData.saleNumber}|${receiptData.total}|${new Date().toISOString()}`

        receipt += EPSON_COMMANDS.QR_MODEL
        receipt += EPSON_COMMANDS.QR_SIZE(6)
        receipt += EPSON_COMMANDS.QR_ERROR_CORRECTION
        receipt += EPSON_COMMANDS.QR_STORE(qrData)
        receipt += EPSON_COMMANDS.QR_PRINT
        receipt += EPSON_COMMANDS.FEED_LINE
      }

      // Mensaje de agradecimiento
      receipt += EPSON_COMMANDS.ALIGN_CENTER
      receipt += EPSON_COMMANDS.FEED_LINE
      receipt += "¡Gracias por su compra!\n"
      receipt += "Vuelva pronto\n"
      receipt += EPSON_COMMANDS.FEED_LINE
      receipt += "Síguenos en redes sociales:\n"
      receipt += "@PizzeriaMarulanda\n"
      receipt += EPSON_COMMANDS.FEED_LINE

      // Corte de papel
      if (settings.autoCut) {
        receipt += EPSON_COMMANDS.FEED_LINES(3)
        receipt += EPSON_COMMANDS.CUT_PARTIAL
      } else {
        receipt += EPSON_COMMANDS.FEED_LINES(6)
      }

      // Enviar todo el recibo
      await sendCommand(receipt)

      // Abrir cajón si es pago en efectivo
      if (receiptData.paymentMethod === "efectivo" && settings.autoOpenDrawer) {
        await openCashDrawer()
      }

      onPrintComplete?.(true)
      return true
    } catch (error) {
      console.error("Error imprimiendo recibo:", error)
      onPrintComplete?.(false)
      return false
    }
  }

  // Imprimir reporte de cierre de caja
  const printCashRegisterReport = async (reportData: any): Promise<boolean> => {
    try {
      let report = ""

      report += EPSON_COMMANDS.INIT
      report += EPSON_COMMANDS.ALIGN_CENTER
      report += EPSON_COMMANDS.DOUBLE_HEIGHT
      report += EPSON_COMMANDS.BOLD_ON
      report += "REPORTE DE CAJA\n"
      report += EPSON_COMMANDS.NORMAL_SIZE
      report += EPSON_COMMANDS.BOLD_OFF
      report += "PIZZERÍA MARULANDA\n"
      report += EPSON_COMMANDS.FEED_LINE

      report += EPSON_COMMANDS.ALIGN_LEFT
      report += "=".repeat(48) + "\n"
      report += `Fecha: ${new Date().toLocaleDateString("es-CO")}\n`
      report += `Responsable: ${reportData.responsible}\n`
      report += `Turno: ${reportData.shift || "Completo"}\n`
      report += "=".repeat(48) + "\n"

      // Información de apertura
      report += EPSON_COMMANDS.BOLD_ON
      report += "APERTURA DE CAJA:\n"
      report += EPSON_COMMANDS.BOLD_OFF
      report += `Hora: ${new Date(reportData.openingTime).toLocaleTimeString("es-CO")}\n`
      report += `Monto inicial: $${reportData.openingAmount.toLocaleString("es-CO")}\n`
      report += `Abierta por: ${reportData.openedBy}\n`
      report += EPSON_COMMANDS.FEED_LINE

      // Resumen de ventas
      report += EPSON_COMMANDS.BOLD_ON
      report += "RESUMEN DE VENTAS:\n"
      report += EPSON_COMMANDS.BOLD_OFF
      report += `Total ventas: ${reportData.totalSales}\n`
      report += `Ventas en efectivo: $${reportData.cashSales.toLocaleString("es-CO")}\n`
      report += `Ventas con tarjeta: $${reportData.cardSales.toLocaleString("es-CO")}\n`
      report += `Transferencias: $${reportData.transferSales.toLocaleString("es-CO")}\n`
      report += "-".repeat(48) + "\n"
      report += `TOTAL INGRESOS: $${reportData.totalIncome.toLocaleString("es-CO")}\n`
      report += EPSON_COMMANDS.FEED_LINE

      // Gastos y retiros
      if (reportData.expenses > 0) {
        report += EPSON_COMMANDS.BOLD_ON
        report += "GASTOS Y RETIROS:\n"
        report += EPSON_COMMANDS.BOLD_OFF
        report += `Total gastos: $${reportData.expenses.toLocaleString("es-CO")}\n`
        report += EPSON_COMMANDS.FEED_LINE
      }

      // Cierre de caja
      report += EPSON_COMMANDS.BOLD_ON
      report += "CIERRE DE CAJA:\n"
      report += EPSON_COMMANDS.BOLD_OFF
      report += `Hora: ${new Date().toLocaleTimeString("es-CO")}\n`
      report += `Monto esperado: $${reportData.expectedAmount.toLocaleString("es-CO")}\n`
      report += `Monto contado: $${reportData.actualAmount.toLocaleString("es-CO")}\n`

      const difference = reportData.actualAmount - reportData.expectedAmount
      report += `Diferencia: ${difference >= 0 ? "+" : ""}$${difference.toLocaleString("es-CO")}\n`

      if (difference !== 0) {
        report += EPSON_COMMANDS.FEED_LINE
        report += difference > 0 ? "SOBRANTE EN CAJA\n" : "FALTANTE EN CAJA\n"
      }

      report += "=".repeat(48) + "\n"
      report += EPSON_COMMANDS.ALIGN_CENTER
      report += "Reporte generado automáticamente\n"
      report += `${new Date().toLocaleString("es-CO")}\n`

      if (settings.autoCut) {
        report += EPSON_COMMANDS.FEED_LINES(3)
        report += EPSON_COMMANDS.CUT_PARTIAL
      } else {
        report += EPSON_COMMANDS.FEED_LINES(6)
      }

      await sendCommand(report)
      return true
    } catch (error) {
      console.error("Error imprimiendo reporte:", error)
      return false
    }
  }

  // Prueba de impresión
  const printTest = async (): Promise<boolean> => {
    try {
      let test = ""

      test += EPSON_COMMANDS.INIT
      test += EPSON_COMMANDS.ALIGN_CENTER
      test += EPSON_COMMANDS.DOUBLE_HEIGHT
      test += EPSON_COMMANDS.BOLD_ON
      test += "PRUEBA DE IMPRESIÓN\n"
      test += EPSON_COMMANDS.NORMAL_SIZE
      test += EPSON_COMMANDS.BOLD_OFF
      test += EPSON_COMMANDS.FEED_LINE

      test += EPSON_COMMANDS.ALIGN_LEFT
      test += "Impresora: Epson TM-T20III\n"
      test += `Fecha: ${new Date().toLocaleDateString("es-CO")}\n`
      test += `Hora: ${new Date().toLocaleTimeString("es-CO")}\n"
      test += EPSON_COMMANDS.FEED_LINE

      test += "Prueba de formatos:\n"
      test += EPSON_COMMANDS.BOLD_ON
      test += "Texto en NEGRITA\n"
      test += EPSON_COMMANDS.BOLD_OFF
      test += EPSON_COMMANDS.UNDERLINE_ON
      test += "Texto subrayado\n"
      test += EPSON_COMMANDS.UNDERLINE_OFF

      test += EPSON_COMMANDS.ALIGN_CENTER
      test += "Texto centrado\n"
      test += EPSON_COMMANDS.ALIGN_RIGHT
      test += "Texto a la derecha\n"
      test += EPSON_COMMANDS.ALIGN_LEFT

      test += EPSON_COMMANDS.FEED_LINE
      test += "Caracteres especiales: ñáéíóú ¿¡\n"
      test += "Símbolos: $ € £ ¥ © ® ™\n"

      if (settings.autoCut) {
        test += EPSON_COMMANDS.FEED_LINES(3)
        test += EPSON_COMMANDS.CUT_PARTIAL
      } else {
        test += EPSON_COMMANDS.FEED_LINES(6)
      }

      await sendCommand(test)
      return true
    } catch (error) {
      console.error("Error en prueba de impresión:", error)
      return false
    }
  }

  return (
    <div className="space-y-6">
      {/* Estado de conexión */}
      <Card className={`border-l-4 $isConnected ? "border-l-green-500 bg-green-50" : \"border-l-red-500 bg-red-50"`}>
        <CardHeader>\
          <CardTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Epson TM-T20III
            {isConnected && <Badge className="bg-green-100 text-green-800">Conectada</Badge>}
          </CardTitle>
          <CardDescription>Impresora térmica de recibos 80mm</CardDescription>
        </CardHeader>
        <CardContent>
          {deviceInfo ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Información del Dispositivo</div>
                <div className="space-y-1 text-sm">
                  <div>
                    <strong>Modelo:</strong> {deviceInfo.productName}
                  </div>
                  <div>
                    <strong>Fabricante:</strong> {deviceInfo.manufacturerName}
                  </div>
                  <div>
                    <strong>Serie:</strong> {deviceInfo.serialNumber}
                  </div>
                  <div>
                    <strong>Firmware:</strong> {deviceInfo.firmwareVersion}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Estado</div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Conectada y lista</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Usb className="h-4 w-4 text-blue-600" />
                    <span>Conexión USB</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-gray-600" />
                    <span>Configurada</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <AlertCircle className="h-8 w-8 mx-auto text-red-500 mb-2" />
              <p className="text-gray-600">Impresora no conectada</p>
              <p className="text-sm text-gray-500">Conecta tu Epson TM-T20III por USB</p>
            </div>
          )}

          <div className="flex gap-2 mt-4">
            {!isConnected ? (
              <Button onClick={connectToDevice} disabled={isConnecting} className="bg-blue-600 hover:bg-blue-700">
                {isConnecting ? "Conectando..." : "Conectar Impresora"}
              </Button>
            ) : (
              <Button onClick={disconnectDevice} variant="outline">
                Desconectar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Configuración */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Impresión</CardTitle>
          <CardDescription>Personaliza el comportamiento de la impresora</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Abrir cajón automáticamente</Label>
                  <p className="text-sm text-gray-500">Para pagos en efectivo</p>
                </div>
                <Switch
                  checked={settings.autoOpenDrawer}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoOpenDrawer: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Corte automático de papel</Label>
                  <p className="text-sm text-gray-500">Corta el papel después de imprimir</p>
                </div>
                <Switch
                  checked={settings.autoCut}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoCut: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Sonidos habilitados</Label>
                  <p className="text-sm text-gray-500">Beep de confirmación</p>
                </div>
                <Switch
                  checked={settings.buzzerEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, buzzerEnabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Imprimir logo</Label>
                  <p className="text-sm text-gray-500">Logo de la pizzería en recibos</p>
                </div>
                <Switch
                  checked={settings.printLogo}
                  onCheckedChange={(checked) => setSettings({ ...settings, printLogo: checked })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Pin del cajón de dinero</Label>
                <Select value={settings.drawerPin} onValueChange={(value) => setSettings({ ...settings, drawerPin: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pin2">Pin 2 (Estándar)</SelectItem>
                    <SelectItem value="pin5">Pin 5 (Alternativo)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Conjunto de caracteres</Label>
                <Select
                  value={settings.characterSet}
                  onValueChange={(value) => setSettings({ ...settings, characterSet: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PC437_USA">PC437 USA</SelectItem>
                    <SelectItem value="PC850_MULTILINGUAL">PC850 Multilingual</SelectItem>
                    <SelectItem value="PC860_PORTUGUESE">PC860 Portuguese</SelectItem>
                    <SelectItem value="PC863_CANADIAN_FRENCH">PC863 Canadian French</SelectItem>
                    <SelectItem value="PC865_NORDIC">PC865 Nordic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Densidad de impresión</Label>
                <Select
                  value={settings.printDensity}
                  onValueChange={(value) => setSettings({ ...settings, printDensity: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Ligera</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="dark">Oscura</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pruebas */}
      <Card>
        <CardHeader>
          <CardTitle>Pruebas de Funcionalidad</CardTitle>
          <CardDescription>Prueba las funciones de tu impresora Epson TM-T20III</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={openCashDrawer}
              disabled={!isConnected}
              className="h-20 flex flex-col items-center justify-center"
            >
              <div className="text-2xl mb-2">💰</div>
              Abrir Cajón
            </Button>

            <Button
              onClick={printTest}
              disabled={!isConnected}
              className="h-20 flex flex-col items-center justify-center"
            >
              <div className="text-2xl mb-2">🧾</div>
              Prueba de Impresión
            </Button>

            <Button
              onClick={() => sendCommand(EPSON_COMMANDS.BEEP)}
              disabled={!isConnected}
              className="h-20 flex flex-col items-center justify-center"
            >
              <div className="text-2xl mb-2">🔊</div>
              Sonido
            </Button>

            <Button
              onClick={() => sendCommand(EPSON_COMMANDS.INIT)}
              disabled={!isConnected}
              className="h-20 flex flex-col items-center justify-center"
            >
              <div className="text-2xl mb-2">🔄</div>
              Reiniciar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Especificaciones técnicas */}
      <Card>
        <CardHeader>
          <CardTitle>Especificaciones Técnicas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Impresión</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Método: Térmica directa</li>
                <li>• Velocidad: 250 mm/seg</li>
                <li>• Resolución: 203 dpi</li>
                <li>• Ancho de papel: 80mm</li>
                <li>• Caracteres por línea: 48</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Conectividad</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• USB 2.0</li>
                <li>• Serial RS-232</li>
                <li>• Ethernet (opcional)</li>
                <li>• Bluetooth (opcional)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Características</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Cajón de dinero</li>
                <li>• Cortador automático</li>
                <li>• Buzzer integrado</li>
                <li>• Códigos de barras</li>
                <li>• Códigos QR</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Hook para usar el driver de Epson TM-T20III
export function useEpsonTMT20III() {
  const [isConnected, setIsConnected] = useState(false)
  const [driver, setDriver] = useState<any>(null)

  const connect = async () => {
    // Lógica de conexión
    setIsConnected(true)
  }

  const disconnect = () => {
    setIsConnected(false)
    setDriver(null)
  }

  const printReceipt = async (receiptData: any) => {
    if (!isConnected || !driver) {
      throw new Error("Impresora no conectada")
    }
    return await driver.printReceipt(receiptData)
  }

  const openDrawer = async () => {
    if (!isConnected || !driver) {
      throw new Error("Impresora no conectada")
    }
    return await driver.openCashDrawer()
  }

  return {
    isConnected,
    connect,
    disconnect,
    printReceipt,
    openDrawer,
  }
}
