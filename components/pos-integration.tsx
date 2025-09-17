"use client"

import { useState } from "react"
import { Printer, Wifi, Usb, Bluetooth, Settings, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { EpsonTMT20IIIDriver } from "./epson-tm-t20iii-driver"

// Tipos de conexión soportados
export type ConnectionType = "usb" | "serial" | "ethernet" | "bluetooth"

// Configuración de la máquina registradora
export interface POSConfig {
  id: string
  name: string
  brand: string
  model: string
  connectionType: ConnectionType
  connectionString: string
  isConnected: boolean
  features: {
    cashDrawer: boolean
    printer: boolean
    display: boolean
    scanner: boolean
  }
  settings: {
    autoOpenDrawer: boolean
    printReceipts: boolean
    displayCustomer: boolean
    soundEnabled: boolean
  }
}

export function POSIntegration() {
  const [posDevices, setPosDevices] = useState<POSConfig[]>([])
  const [selectedDevice, setSelectedDevice] = useState<POSConfig | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"disconnected" | "connecting" | "connected">("disconnected")
  const [showEpsonDriver, setShowEpsonDriver] = useState(false)

  // Marcas y modelos soportados
  const supportedDevices = [
    { brand: "Epson", models: ["TM-T20III", "TM-T82III", "TM-U220"] },
    { brand: "Star", models: ["TSP143III", "TSP650II", "TSP700II"] },
    { brand: "Citizen", models: ["CT-S310A", "CT-S4000", "CT-E351"] },
    { brand: "Bixolon", models: ["SRP-350III", "SRP-275III", "SRP-Q300"] },
    { brand: "Custom", models: ["VKP80III", "TG2480-H"] },
  ]

  // Escanear dispositivos disponibles
  const scanForDevices = async () => {
    setIsScanning(true)

    try {
      // Simular escaneo de dispositivos (en producción usarías APIs reales)
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const mockDevices: POSConfig[] = [
        {
          id: "epson-tm-t20iii-usb",
          name: "Epson TM-T20III",
          brand: "Epson",
          model: "TM-T20III",
          connectionType: "usb",
          connectionString: "USB\\VID_04B8&PID_0202",
          isConnected: false,
          features: {
            cashDrawer: true,
            printer: true,
            display: false,
            scanner: false,
          },
          settings: {
            autoOpenDrawer: true,
            printReceipts: true,
            displayCustomer: false,
            soundEnabled: true,
          },
        },
        {
          id: "star-tsp143-ethernet",
          name: "Star TSP143III",
          brand: "Star",
          model: "TSP143III",
          connectionType: "ethernet",
          connectionString: "192.168.1.100:9100",
          isConnected: false,
          features: {
            cashDrawer: true,
            printer: true,
            display: false,
            scanner: false,
          },
          settings: {
            autoOpenDrawer: true,
            printReceipts: true,
            displayCustomer: false,
            soundEnabled: true,
          },
        },
      ]

      setPosDevices(mockDevices)
    } catch (error) {
      console.error("Error escaneando dispositivos:", error)
    } finally {
      setIsScanning(false)
    }
  }

  // Conectar a dispositivo
  const connectToDevice = async (device: POSConfig) => {
    setConnectionStatus("connecting")

    try {
      // Simular conexión (en producción usarías drivers reales)
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Actualizar estado del dispositivo
      setPosDevices((prev) =>
        prev.map((d) => (d.id === device.id ? { ...d, isConnected: true } : { ...d, isConnected: false })),
      )

      setSelectedDevice({ ...device, isConnected: true })
      setConnectionStatus("connected")

      // Si es Epson TM-T20III, mostrar el driver específico
      if (device.model === "TM-T20III") {
        setShowEpsonDriver(true)
      }
    } catch (error) {
      console.error("Error conectando:", error)
      setConnectionStatus("disconnected")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Integración POS</h2>
          <p className="text-gray-600">Conecta y configura tu máquina registradora</p>
        </div>
        <Button onClick={scanForDevices} disabled={isScanning} className="bg-blue-600 hover:bg-blue-700">
          <Settings className="h-4 w-4 mr-2" />
          {isScanning ? "Escaneando..." : "Escanear Dispositivos"}
        </Button>
      </div>

      {/* Estado de conexión */}
      <Card
        className={`border-l-4 ${
          connectionStatus === "connected"
            ? "border-l-green-500 bg-green-50"
            : connectionStatus === "connecting"
              ? "border-l-yellow-500 bg-yellow-50"
              : "border-l-red-500 bg-red-50"
        }`}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {connectionStatus === "connected" ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : connectionStatus === "connecting" ? (
              <Settings className="h-5 w-5 text-yellow-600 animate-spin" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            Estado de Conexión
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDevice ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600">Dispositivo</div>
                <div className="font-bold">{selectedDevice.name}</div>
                <div className="text-sm text-gray-500">
                  {selectedDevice.brand} {selectedDevice.model}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Conexión</div>
                <div className="font-bold">{selectedDevice.connectionType.toUpperCase()}</div>
                <div className="text-sm text-gray-500">{selectedDevice.connectionString}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Estado</div>
                <Badge
                  className={
                    connectionStatus === "connected"
                      ? "bg-green-100 text-green-800"
                      : connectionStatus === "connecting"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }
                >
                  {connectionStatus === "connected"
                    ? "Conectado"
                    : connectionStatus === "connecting"
                      ? "Conectando..."
                      : "Desconectado"}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">No hay dispositivo seleccionado</p>
              <p className="text-sm text-gray-400">Escanea y selecciona un dispositivo para comenzar</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Driver específico para Epson TM-T20III */}
      {showEpsonDriver && selectedDevice?.model === "TM-T20III" && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Printer className="h-5 w-5 text-blue-600" />
              Driver Epson TM-T20III
              <Badge className="bg-blue-100 text-blue-800">Configuración Específica</Badge>
            </CardTitle>
            <CardDescription>Configuración avanzada y específica para tu impresora Epson TM-T20III</CardDescription>
          </CardHeader>
          <CardContent>
            <EpsonTMT20IIIDriver
              onConnectionChange={(connected) => {
                setConnectionStatus(connected ? "connected" : "disconnected")
              }}
              onPrintComplete={(success) => {
                console.log("Impresión completada:", success)
              }}
            />
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="devices" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white border">
          <TabsTrigger value="devices">Dispositivos</TabsTrigger>
          <TabsTrigger value="test">Pruebas</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
          <TabsTrigger value="supported">Compatibilidad</TabsTrigger>
        </TabsList>

        <TabsContent value="devices" className="space-y-4">
          {posDevices.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Printer className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron dispositivos</h3>
                <p className="text-gray-500 mb-4">
                  Asegúrate de que tu máquina registradora esté conectada y encendida
                </p>
                <Button onClick={scanForDevices} disabled={isScanning}>
                  {isScanning ? "Escaneando..." : "Escanear Nuevamente"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {posDevices.map((device) => (
                <Card
                  key={device.id}
                  className={`cursor-pointer transition-all ${
                    device.isConnected ? "ring-2 ring-green-500 bg-green-50" : "hover:shadow-md"
                  }`}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Printer className="h-5 w-5" />
                        {device.name}
                      </div>
                      {device.isConnected && <Badge className="bg-green-100 text-green-800">Conectado</Badge>}
                      {device.model === "TM-T20III" && <Badge className="bg-blue-100 text-blue-800">Recomendado</Badge>}
                    </CardTitle>
                    <CardDescription>
                      {device.brand} {device.model} • {device.connectionType.toUpperCase()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          {device.connectionType === "usb" && <Usb className="h-4 w-4" />}
                          {device.connectionType === "ethernet" && <Wifi className="h-4 w-4" />}
                          {device.connectionType === "bluetooth" && <Bluetooth className="h-4 w-4" />}
                          <span>{device.connectionString}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {device.features.printer && (
                          <Badge variant="outline" className="text-xs">
                            Impresora
                          </Badge>
                        )}
                        {device.features.cashDrawer && (
                          <Badge variant="outline" className="text-xs">
                            Cajón
                          </Badge>
                        )}
                        {device.features.display && (
                          <Badge variant="outline" className="text-xs">
                            Display
                          </Badge>
                        )}
                        {device.features.scanner && (
                          <Badge variant="outline" className="text-xs">
                            Scanner
                          </Badge>
                        )}
                      </div>

                      <Button
                        onClick={() => connectToDevice(device)}
                        disabled={device.isConnected || connectionStatus === "connecting"}
                        className="w-full mt-4"
                      >
                        {device.isConnected ? "Conectado" : "Conectar"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pruebas de Funcionalidad</CardTitle>
              <CardDescription>Prueba las funciones de tu máquina registradora</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  disabled={!selectedDevice?.isConnected}
                  className="h-20 flex flex-col items-center justify-center"
                >
                  <div className="text-2xl mb-2">💰</div>
                  Abrir Cajón
                </Button>

                <Button
                  disabled={!selectedDevice?.isConnected}
                  className="h-20 flex flex-col items-center justify-center"
                >
                  <div className="text-2xl mb-2">🧾</div>
                  Imprimir Prueba
                </Button>

                <Button
                  disabled={!selectedDevice?.isConnected}
                  className="h-20 flex flex-col items-center justify-center"
                >
                  <div className="text-2xl mb-2">🔊</div>
                  Sonido
                </Button>

                <Button
                  disabled={!selectedDevice?.isConnected}
                  className="h-20 flex flex-col items-center justify-center"
                >
                  <div className="text-2xl mb-2">🔄</div>
                  Reiniciar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          {selectedDevice && (
            <Card>
              <CardHeader>
                <CardTitle>Configuración del Dispositivo</CardTitle>
                <CardDescription>Personaliza el comportamiento de {selectedDevice.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Abrir cajón automáticamente</Label>
                    <p className="text-sm text-gray-500">Abre el cajón al completar una venta</p>
                  </div>
                  <Switch
                    checked={selectedDevice.settings.autoOpenDrawer}
                    onCheckedChange={(checked) => {
                      setSelectedDevice({
                        ...selectedDevice,
                        settings: { ...selectedDevice.settings, autoOpenDrawer: checked },
                      })
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Imprimir recibos</Label>
                    <p className="text-sm text-gray-500">Imprime recibo automáticamente</p>
                  </div>
                  <Switch
                    checked={selectedDevice.settings.printReceipts}
                    onCheckedChange={(checked) => {
                      setSelectedDevice({
                        ...selectedDevice,
                        settings: { ...selectedDevice.settings, printReceipts: checked },
                      })
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Sonidos habilitados</Label>
                    <p className="text-sm text-gray-500">Reproduce sonidos de confirmación</p>
                  </div>
                  <Switch
                    checked={selectedDevice.settings.soundEnabled}
                    onCheckedChange={(checked) => {
                      setSelectedDevice({
                        ...selectedDevice,
                        settings: { ...selectedDevice.settings, soundEnabled: checked },
                      })
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="supported" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dispositivos Compatibles</CardTitle>
              <CardDescription>Marcas y modelos soportados por el sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {supportedDevices.map((brand) => (
                  <div key={brand.brand} className="border rounded-lg p-4">
                    <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                      {brand.brand}
                      {brand.brand === "Epson" && (
                        <Badge className="bg-blue-100 text-blue-800 text-xs">Recomendado</Badge>
                      )}
                    </h4>
                    <ul className="space-y-1">
                      {brand.models.map((model) => (
                        <li key={model} className="text-sm text-gray-600 flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {model}
                          {model === "TM-T20III" && (
                            <Badge className="bg-green-100 text-green-800 text-xs">Configurado</Badge>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Tipos de Conexión Soportados:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <Usb className="h-4 w-4" />
                    USB
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <Wifi className="h-4 w-4" />
                    Ethernet
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <Bluetooth className="h-4 w-4" />
                    Bluetooth
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <Settings className="h-4 w-4" />
                    Serial
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">🎯 Recomendación Especial: Epson TM-T20III</h4>
                <p className="text-sm text-green-700">
                  La Epson TM-T20III es nuestra recomendación principal por su excelente relación calidad-precio,
                  confiabilidad y compatibilidad total con nuestro sistema. Incluye configuración específica y
                  optimizada para pizzerías.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
