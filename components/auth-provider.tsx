"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

// Definición de tipos
export type UserRole = "owner" | "cashier"

export interface User {
  id: string
  username: string
  fullName: string
  role: UserRole
  isActive: boolean
  createdAt: string
  lastLogin?: string
}

export interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  canAccessModule: (module: string) => boolean
  hasPermission: (module: string, action: string) => boolean
  canViewPrices: () => boolean
  isLoading: boolean
}

// Configuración de roles y permisos
export const ROLE_PERMISSIONS = {
  owner: {
    modules: ["cash", "sales", "menu", "products", "utensils", "users"],
    permissions: {
      cash: ["read", "write", "admin"],
      sales: ["read", "write", "admin"],
      menu: ["read", "write", "admin"],
      products: ["read", "write", "admin"],
      utensils: ["read", "write", "admin"],
      users: ["read", "write", "admin"],
    },
  },
  cashier: {
    modules: ["cash", "sales", "menu", "products"],
    permissions: {
      cash: ["read", "write"],
      sales: ["read", "write"],
      menu: ["read"],
      products: ["read"], // Solo lectura, sin precios
      utensils: [],
      users: [],
    },
  },
}

export const ROLE_DESCRIPTIONS = {
  owner: {
    name: "Propietario",
    color: "bg-purple-100 text-purple-800",
    description: "Acceso completo al sistema",
  },
  cashier: {
    name: "Cajero",
    color: "bg-blue-100 text-blue-800",
    description: "Acceso a ventas y caja",
  },
}

// Usuarios de demostración
const DEMO_USERS: User[] = [
  {
    id: "1",
    username: "propietario",
    fullName: "Propietario Pizzería",
    role: "owner",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    username: "cajero1",
    fullName: "María González",
    role: "cashier",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "3",
    username: "cajero2",
    fullName: "Carlos Rodríguez",
    role: "cashier",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
]

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar si hay una sesión guardada
    const savedUser = localStorage.getItem("pizzeria_user")
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        localStorage.removeItem("pizzeria_user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    // Simulación de autenticación
    const foundUser = DEMO_USERS.find((u) => u.username === username && u.isActive)

    if (foundUser && password === "123456") {
      const userWithLogin = {
        ...foundUser,
        lastLogin: new Date().toISOString(),
      }
      setUser(userWithLogin)
      localStorage.setItem("pizzeria_user", JSON.stringify(userWithLogin))
      return true
    }

    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("pizzeria_user")
  }

  const canAccessModule = (module: string): boolean => {
    if (!user) return false
    return ROLE_PERMISSIONS[user.role].modules.includes(module)
  }

  const hasPermission = (module: string, action: string): boolean => {
    if (!user) return false
    const permissions = ROLE_PERMISSIONS[user.role].permissions[module] || []
    return permissions.includes(action)
  }

  const canViewPrices = (): boolean => {
    if (!user) return false
    // Solo el propietario puede ver precios
    return user.role === "owner"
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        canAccessModule,
        hasPermission,
        canViewPrices,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
