"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { LogIn, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth, ROLE_DESCRIPTIONS } from "@/components/auth-provider"

export function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const success = await login(username, password)
      if (!success) {
        setError("Usuario o contraseña incorrectos")
      }
    } catch (err) {
      setError("Error al iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <Image src="/login-bg.jpg" alt="" fill priority sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-white/60 sm:bg-white/50 md:bg-white/40" />
      <div className="relative z-10 w-full max-w-md space-y-6">
        {/* Logo y título */}
        <div className="text-center">
          <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">PM</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Pizzería Marulanda</h1>
          <p className="text-gray-600">Sistema de Inventario y Ventas</p>
        </div>

        {/* Formulario de login */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">Iniciar Sesión</CardTitle>
            <CardDescription className="text-center">Ingresa tus credenciales para acceder al sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-gray-700">
                  Usuario
                </label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ingresa tu usuario"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña"
                    required
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Iniciando sesión...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Iniciar Sesión
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Usuarios de demostración */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-blue-900">Usuarios de Demostración</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-white rounded border">
                <div>
                  <div className="font-medium text-sm">propietario</div>
                  <div className="text-xs text-gray-500">Acceso completo</div>
                </div>
                <div className="text-right">
                  <div className={`text-xs px-2 py-1 rounded ${ROLE_DESCRIPTIONS.owner.color}`}>
                    {ROLE_DESCRIPTIONS.owner.name}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 bg-white rounded border">
                <div>
                  <div className="font-medium text-sm">cajero1</div>
                  <div className="text-xs text-gray-500">María González</div>
                </div>
                <div className="text-right">
                  <div className={`text-xs px-2 py-1 rounded ${ROLE_DESCRIPTIONS.cashier.color}`}>
                    {ROLE_DESCRIPTIONS.cashier.name}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 bg-white rounded border">
                <div>
                  <div className="font-medium text-sm">cajero2</div>
                  <div className="text-xs text-gray-500">Carlos Rodríguez</div>
                </div>
                <div className="text-right">
                  <div className={`text-xs px-2 py-1 rounded ${ROLE_DESCRIPTIONS.cashier.color}`}>
                    {ROLE_DESCRIPTIONS.cashier.name}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-xs text-blue-700 bg-blue-100 p-2 rounded">
              <strong>Contraseña para todos:</strong> 123456
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
