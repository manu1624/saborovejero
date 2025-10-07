"use client"

import { useState } from "react"
import { AuthProvider, useAuth, ROLE_DESCRIPTIONS } from "@/components/auth-provider"
import { InventoryProvider, useInventory } from "@/components/inventory-provider"
import { LoginForm } from "@/components/login-form"
import { StockAlerts } from "@/components/stock-alerts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, Calculator, Receipt, ChefHat, Package, Wrench, Users, LogOut as LogoutIcon } from "lucide-react"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { CashRegisterManagement } from "@/components/cash-register-management"
import { SalesManagement } from "@/components/sales-management"
import { MenuManagement } from "@/components/menu-management"
import { ProductList } from "@/components/product-list"
import { UtensilList } from "@/components/utensil-list"
import { UserManagement } from "@/components/user-management"

type ModuleKey = "cash" | "sales" | "menu" | "products" | "utensils" | "users"

function AppContent() {
  const { user, isLoading } = useAuth()

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
      <AppShell />
    </InventoryProvider>
  )
}

function AppShell() {
  const { user, logout } = useAuth()
  const { products, utensils } = useInventory()
  const [activeModule, setActiveModule] = useState<ModuleKey>("cash")

  return (
      <SidebarProvider>
        <Sidebar collapsible="offcanvas" className="bg-white border-r">
          <SidebarHeader>
            <div className="flex items-center gap-3 px-2 py-1">
              <div className="w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-white">PM</span>
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900">Pizzería Marulanda</div>
                <div className="text-xs text-gray-600">Inventario y Ventas</div>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Módulos</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive={activeModule === "cash"} onClick={() => setActiveModule("cash")}>
                      <Calculator />
                      <span>Caja</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive={activeModule === "sales"} onClick={() => setActiveModule("sales")}>
                      <Receipt />
                      <span>Ventas</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive={activeModule === "menu"} onClick={() => setActiveModule("menu")}>
                      <ChefHat />
                      <span>Menú</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive={activeModule === "products"} onClick={() => setActiveModule("products")}>
                      <Package />
                      <span>Productos</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive={activeModule === "utensils"} onClick={() => setActiveModule("utensils")}>
                      <Wrench />
                      <span>Utensilios</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive={activeModule === "users"} onClick={() => setActiveModule("users")}>
                      <Users />
                      <span>Usuarios</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <div className="px-2 py-2 border-t">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{user.fullName}</div>
                  <Badge className={ROLE_DESCRIPTIONS[user.role].color} variant="secondary">
                    {ROLE_DESCRIPTIONS[user.role].name}
                  </Badge>
                </div>
                <Button variant="outline" size="icon" onClick={logout} aria-label="Salir">
                  <LogoutIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <header className="bg-white border-b">
            <div className="flex items-center gap-2 h-14 px-4">
              <SidebarTrigger />
              <div className="font-semibold">
                {activeModule === "cash" && "Caja"}
                {activeModule === "sales" && "Ventas"}
                {activeModule === "menu" && "Menú"}
                {activeModule === "products" && "Productos"}
                {activeModule === "utensils" && "Utensilios"}
                {activeModule === "users" && "Usuarios"}
              </div>
              <div className="ml-auto">
                {user.role === "cashier" && (
                  <div className="flex items-center gap-2 text-orange-600">
                    <Bell className="h-4 w-4" />
                    <span className="text-sm hidden sm:inline">Alertas activas</span>
                  </div>
                )}
              </div>
            </div>
          </header>

          <div className="p-4">
            {user.role === "cashier" && (
              <div className="mb-4">
                <StockAlerts />
              </div>
            )}

            {activeModule === "cash" && <CashRegisterManagement />}
            {activeModule === "sales" && <SalesManagement />}
            {activeModule === "menu" && <MenuManagement />}
            {activeModule === "products" && <ProductList products={products} />}
            {activeModule === "utensils" && <UtensilList utensils={utensils} onSelectUtensil={() => {}} />}
            {activeModule === "users" && <UserManagement />}
          </div>
        </SidebarInset>
      </SidebarProvider>
  )
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
