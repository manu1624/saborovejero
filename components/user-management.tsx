"use client"

import { useState } from "react"
import { Plus, Users, Edit, Trash2, UserCheck, UserX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth, ROLE_DESCRIPTIONS } from "@/components/auth-provider"
import { UserForm } from "@/components/user-form"

export function UserManagement() {
  const { user, hasPermission } = useAuth()
  const [showUserForm, setShowUserForm] = useState(false)
  const [editingUser, setEditingUser] = useState<string | null>(null)

  // Solo el propietario puede gestionar usuarios
  if (!user || user.role !== "owner" || !hasPermission("users", "read")) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Sin permisos</h3>
        <p className="text-gray-500">No tienes permisos para gestionar usuarios</p>
      </div>
    )
  }

  // Usuarios de demostración (en producción vendrían de la base de datos)
  const users = [
    {
      id: "1",
      username: "propietario",
      fullName: "Propietario Pizzería",
      role: "owner" as const,
      isActive: true,
      createdAt: "2024-01-01T00:00:00Z",
      lastLogin: "2024-01-20T10:30:00Z",
    },
    {
      id: "2",
      username: "cajero1",
      fullName: "María González",
      role: "cashier" as const,
      isActive: true,
      createdAt: "2024-01-01T00:00:00Z",
      lastLogin: "2024-01-20T09:15:00Z",
    },
    {
      id: "3",
      username: "cajero2",
      fullName: "Carlos Rodríguez",
      role: "cashier" as const,
      isActive: true,
      createdAt: "2024-01-01T00:00:00Z",
      lastLogin: "2024-01-19T16:45:00Z",
    },
  ]

  const handleToggleActive = (userId: string, currentStatus: boolean) => {
    // En producción, aquí harías la llamada a la API
    console.log(`Toggling user ${userId} from ${currentStatus} to ${!currentStatus}`)
  }

  const handleDeleteUser = (userId: string, userName: string) => {
    if (confirm(`¿Estás seguro de que quieres eliminar al usuario "${userName}"?`)) {
      // En producción, aquí harías la llamada a la API
      console.log(`Deleting user ${userId}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h2>
          <p className="text-gray-600">Administra los usuarios del sistema</p>
        </div>
        {hasPermission("users", "write") && (
          <Button onClick={() => setShowUserForm(true)} className="bg-amber-600 hover:bg-amber-700">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Usuario
          </Button>
        )}
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">usuarios registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{users.filter((u) => u.isActive).length}</div>
            <p className="text-xs text-muted-foreground">pueden acceder al sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cajeros</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{users.filter((u) => u.role === "cashier").length}</div>
            <p className="text-xs text-muted-foreground">personal de atención</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de usuarios */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios del Sistema</CardTitle>
          <CardDescription>Lista de todos los usuarios registrados</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Último Acceso</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((userItem) => (
                <TableRow key={userItem.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{userItem.fullName}</div>
                      <div className="text-sm text-gray-500">@{userItem.username}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={ROLE_DESCRIPTIONS[userItem.role].color}>
                      {ROLE_DESCRIPTIONS[userItem.role].name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {userItem.isActive ? (
                      <Badge className="bg-green-100 text-green-800">
                        <UserCheck className="h-3 w-3 mr-1" />
                        Activo
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800">
                        <UserX className="h-3 w-3 mr-1" />
                        Inactivo
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {userItem.lastLogin ? (
                      <div className="text-sm">
                        {new Date(userItem.lastLogin).toLocaleDateString("es-CO")}
                        <div className="text-xs text-gray-500">
                          {new Date(userItem.lastLogin).toLocaleTimeString("es-CO")}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Nunca</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {hasPermission("users", "write") && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => setEditingUser(userItem.id)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleActive(userItem.id, userItem.isActive)}
                            className={
                              userItem.isActive
                                ? "text-red-600 hover:text-red-700"
                                : "text-green-600 hover:text-green-700"
                            }
                          >
                            {userItem.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </Button>
                          {userItem.id !== user.id && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteUser(userItem.id, userItem.fullName)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Información sobre roles */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Información sobre Roles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-white rounded border">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={ROLE_DESCRIPTIONS.owner.color}>{ROLE_DESCRIPTIONS.owner.name}</Badge>
              </div>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Acceso completo al sistema</li>
                <li>• Gestión de usuarios</li>
                <li>• Ve precios y reportes financieros</li>
                <li>• Puede crear, editar y eliminar todo</li>
              </ul>
            </div>
            <div className="p-3 bg-white rounded border">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={ROLE_DESCRIPTIONS.cashier.color}>{ROLE_DESCRIPTIONS.cashier.name}</Badge>
              </div>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Acceso a caja y ventas</li>
                <li>• Consulta de menú y productos</li>
                <li>• Ve solo cantidades (sin precios)</li>
                <li>• Recibe alertas de stock bajo</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {showUserForm && <UserForm onClose={() => setShowUserForm(false)} />}
      {editingUser && <UserForm onClose={() => setEditingUser(null)} userId={editingUser} />}
    </div>
  )
}
