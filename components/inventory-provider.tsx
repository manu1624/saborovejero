"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

export interface Product {
  id: string
  code: string
  name: string
  category: string
  price: number
  cost?: number
  unit: string
  currentStock: number
  minStock: number
  maxStock?: number
  location?: string
  supplier?: string
  expirationDate?: string
  createdAt: string
  updatedAt: string
}

export interface Utensil {
  id: string
  code: string
  name: string
  category: string
  purchasePrice: number
  currentQuantity: number
  minQuantity: number
  condition: "excelente" | "bueno" | "regular" | "malo" | "dañado"
  location: string
  createdAt: string
  updatedAt: string
}

// Nuevas interfaces para el módulo de ventas
export interface MenuItem {
  id: string
  name: string
  category: string
  price: number
  description: string
  isAvailable: boolean
  preparationTime: number // en minutos
  recipe: RecipeIngredient[]
  createdAt: string
  updatedAt: string
}

export interface RecipeIngredient {
  productId: string
  quantity: number
  unit: string
}

export interface Sale {
  id: string
  saleNumber: string
  items: SaleItem[]
  subtotal: number
  tax: number
  total: number
  paymentMethod: string
  customerName?: string
  customerPhone?: string
  notes?: string
  status: "pending" | "completed" | "cancelled"
  createdAt: string
  updatedAt: string
}

export interface SaleItem {
  menuItemId: string
  menuItemName: string
  quantity: number
  unitPrice: number
  total: number
}

// Agregar las nuevas interfaces después de las interfaces existentes

export interface CashRegister {
  id: string
  date: string // YYYY-MM-DD
  openingAmount: number
  openingTime: string
  closingAmount?: number
  closingTime?: string
  expectedAmount?: number
  difference?: number
  status: "open" | "closed"
  openedBy: string
  closedBy?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface CashMovement {
  id: string
  cashRegisterId: string
  type: "income" | "expense" | "withdrawal" | "deposit"
  amount: number
  description: string
  category: string
  relatedSaleId?: string
  createdAt: string
}

export interface DailyReport {
  id: string
  date: string
  cashRegisterId: string
  openingAmount: number
  closingAmount: number
  totalSales: number
  totalExpenses: number
  netIncome: number
  salesByCategory: Record<string, { quantity: number; revenue: number }>
  topProducts: Array<{ name: string; quantity: number; revenue: number }>
  paymentMethods: Record<string, number>
  status: "pending" | "sent" | "failed"
  emailSentAt?: string
  createdAt: string
}

// Actualizar la interfaz InventoryContextType agregando las nuevas funciones

interface InventoryContextType {
  // Productos (ingredientes/insumos)
  products: Product[]
  addProduct: (product: Omit<Product, "id" | "code" | "createdAt" | "updatedAt">) => void
  updateProduct: (id: string, product: Partial<Product>) => void
  deleteProduct: (id: string) => void
  updateStock: (id: string, quantity: number, operation: "add" | "subtract") => void

  // Utensilios
  utensils: Utensil[]
  addUtensil: (utensil: Omit<Utensil, "id" | "code" | "createdAt" | "updatedAt">) => void
  updateUtensil: (id: string, utensil: Partial<Utensil>) => void
  deleteUtensil: (id: string) => void
  updateUtensilQuantity: (id: string, quantity: number, operation: "add" | "subtract") => void

  // Menú
  menuItems: MenuItem[]
  addMenuItem: (menuItem: Omit<MenuItem, "id" | "createdAt" | "updatedAt">) => void
  updateMenuItem: (id: string, menuItem: Partial<MenuItem>) => void
  deleteMenuItem: (id: string) => void

  // Ventas
  sales: Sale[]
  addSale: (sale: Omit<Sale, "id" | "saleNumber" | "createdAt" | "updatedAt">) => void
  updateSale: (id: string, sale: Partial<Sale>) => void
  deleteSale: (id: string) => void

  // Caja registradora
  cashRegisters: CashRegister[]
  currentCashRegister: CashRegister | null
  openCashRegister: (openingAmount: number, openedBy: string, notes?: string) => void
  closeCashRegister: (closingAmount: number, closedBy: string, notes?: string) => void
  addCashMovement: (movement: Omit<CashMovement, "id" | "createdAt">) => void
  getCashMovements: (cashRegisterId: string) => CashMovement[]

  // Reportes diarios
  dailyReports: DailyReport[]
  generateDailyReport: (date: string) => DailyReport | null
  sendDailyReport: (reportId: string, email: string) => Promise<boolean>

  loading: boolean
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined)

export function useInventory() {
  const context = useContext(InventoryContext)
  if (!context) {
    throw new Error("useInventory must be used within an InventoryProvider")
  }
  return context
}

// Función para generar códigos únicos por categoría
const generateProductCode = (category: string, existingProducts: Product[]): string => {
  const categoryMap: { [key: string]: string } = {
    Pizzería: "PIZ",
    Lasaña: "LAS",
    "Ensaladas de frutas + helados": "ENS",
    "Aromáticas / Cafés": "CAF",
    "Micheladas / Cócteles": "MIC",
  }

  const prefix = categoryMap[category] || "GEN"
  const categoryProducts = existingProducts.filter((p) => p.category === category)
  const nextNumber = categoryProducts.length + 1

  return `${prefix}-${nextNumber.toString().padStart(3, "0")}`
}

const generateUtensilCode = (category: string, existingUtensils: Utensil[]): string => {
  const categoryMap: { [key: string]: string } = {
    Cocina: "COC",
    Servicio: "SER",
    Mobiliario: "MOB",
    Limpieza: "LIM",
    Equipos: "EQU",
  }

  const prefix = categoryMap[category] || "UTE"
  const categoryUtensils = existingUtensils.filter((u) => u.category === category)
  const nextNumber = categoryUtensils.length + 1

  return `${prefix}-${nextNumber.toString().padStart(3, "0")}`
}

const generateSaleNumber = (existingSales: Sale[]): string => {
  const today = new Date()
  const datePrefix = today.toISOString().slice(0, 10).replace(/-/g, "")
  const todaySales = existingSales.filter((s) => s.saleNumber.startsWith(datePrefix))
  const nextNumber = todaySales.length + 1
  return `${datePrefix}-${nextNumber.toString().padStart(3, "0")}`
}

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [utensils, setUtensils] = useState<Utensil[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  // En el InventoryProvider, agregar los nuevos estados después de los existentes

  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>([])
  const [cashMovements, setCashMovements] = useState<CashMovement[]>([])
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([])
  const [loading, setLoading] = useState(true)

  // Cargar datos iniciales
  useEffect(() => {
    const savedProducts = localStorage.getItem("marulanda-products")
    const savedUtensils = localStorage.getItem("marulanda-utensils")
    const savedMenuItems = localStorage.getItem("marulanda-menu")
    const savedSales = localStorage.getItem("marulanda-sales")
    const savedCashRegisters = localStorage.getItem("marulanda-cash-registers")

    // Agregar la carga de datos en el useEffect existente

    if (savedCashRegisters) {
      setCashRegisters(JSON.parse(savedCashRegisters))
    } else {
      setCashRegisters([])
    }

    const savedCashMovements = localStorage.getItem("marulanda-cash-movements")
    if (savedCashMovements) {
      setCashMovements(JSON.parse(savedCashMovements))
    } else {
      setCashMovements([])
    }

    const savedDailyReports = localStorage.getItem("marulanda-daily-reports")
    if (savedDailyReports) {
      setDailyReports(JSON.parse(savedDailyReports))
    } else {
      setDailyReports([])
    }

    if (savedProducts) {
      setProducts(JSON.parse(savedProducts))
    } else {
      // Productos de ejemplo con códigos
      const initialProducts: Product[] = [
        {
          id: "1",
          code: "PIZ-001",
          name: "Harina de Trigo",
          category: "Pizzería",
          price: 3500,
          cost: 2800,
          unit: "kg",
          currentStock: 25,
          minStock: 5,
          maxStock: 60,
          location: "Bodega Secos",
          supplier: "Proveedor A",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "2",
          code: "PIZ-002",
          name: "Queso Mozzarella",
          category: "Pizzería",
          price: 8500,
          cost: 7000,
          unit: "kg",
          currentStock: 10,
          minStock: 2,
          maxStock: 30,
          location: "Refrigeración",
          supplier: "Proveedor B",
          expirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "3",
          code: "CAF-001",
          name: "Café Colombiano",
          category: "Aromáticas / Cafés",
          price: 12000,
          cost: 9000,
          unit: "kg",
          currentStock: 5,
          minStock: 1,
          maxStock: 15,
          location: "Almacén Bebidas",
          supplier: "Proveedor C",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]
      setProducts(initialProducts)
      localStorage.setItem("marulanda-products", JSON.stringify(initialProducts))
    }

    if (savedUtensils) {
      setUtensils(JSON.parse(savedUtensils))
    } else {
      // Utensilios de ejemplo
      const initialUtensils: Utensil[] = [
        {
          id: "1",
          code: "COC-001",
          name: "Horno Industrial",
          category: "Equipos",
          purchasePrice: 2500000,
          currentQuantity: 1,
          minQuantity: 1,
          condition: "excelente",
          location: "Cocina Principal",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "2",
          code: "SER-001",
          name: "Platos para Pizza",
          category: "Servicio",
          purchasePrice: 15000,
          currentQuantity: 24,
          minQuantity: 12,
          condition: "bueno",
          location: "Área de Servicio",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]
      setUtensils(initialUtensils)
      localStorage.setItem("marulanda-utensils", JSON.stringify(initialUtensils))
    }

    if (savedMenuItems) {
      setMenuItems(JSON.parse(savedMenuItems))
    } else {
      // Productos del menú de ejemplo
      const initialMenuItems: MenuItem[] = [
        {
          id: "1",
          name: "Pizza Margarita Personal",
          category: "Pizzería",
          price: 18000,
          description: "Pizza personal con salsa de tomate, queso mozzarella y albahaca",
          isAvailable: true,
          preparationTime: 15,
          recipe: [
            { productId: "1", quantity: 0.15, unit: "kg" }, // Harina
            { productId: "2", quantity: 0.1, unit: "kg" }, // Queso
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Café Americano",
          category: "Aromáticas / Cafés",
          price: 4500,
          description: "Café colombiano preparado en método americano",
          isAvailable: true,
          preparationTime: 5,
          recipe: [{ productId: "3", quantity: 0.02, unit: "kg" }], // Café
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]
      setMenuItems(initialMenuItems)
      localStorage.setItem("marulanda-menu", JSON.stringify(initialMenuItems))
    }

    if (savedSales) {
      setSales(JSON.parse(savedSales))
    } else {
      setSales([])
    }

    setLoading(false)
  }, [])

  // Guardar en localStorage cuando cambien los datos
  useEffect(() => {
    if (!loading) {
      localStorage.setItem("marulanda-products", JSON.stringify(products))
    }
  }, [products, loading])

  useEffect(() => {
    if (!loading) {
      localStorage.setItem("marulanda-utensils", JSON.stringify(utensils))
    }
  }, [utensils, loading])

  useEffect(() => {
    if (!loading) {
      localStorage.setItem("marulanda-menu", JSON.stringify(menuItems))
    }
  }, [menuItems, loading])

  useEffect(() => {
    if (!loading) {
      localStorage.setItem("marulanda-sales", JSON.stringify(sales))
    }
  }, [sales, loading])

  // Agregar los useEffect para guardar en localStorage

  useEffect(() => {
    if (!loading) {
      localStorage.setItem("marulanda-cash-registers", JSON.stringify(cashRegisters))
    }
  }, [cashRegisters, loading])

  useEffect(() => {
    if (!loading) {
      localStorage.setItem("marulanda-cash-movements", JSON.stringify(cashMovements))
    }
  }, [cashMovements, loading])

  useEffect(() => {
    if (!loading) {
      localStorage.setItem("marulanda-daily-reports", JSON.stringify(dailyReports))
    }
  }, [dailyReports, loading])

  // Funciones para productos
  const addProduct = (productData: Omit<Product, "id" | "code" | "createdAt" | "updatedAt">) => {
    const code = generateProductCode(productData.category, products)
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      code,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setProducts((prev) => [...prev, newProduct])
  }

  const updateProduct = (id: string, productData: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id ? { ...product, ...productData, updatedAt: new Date().toISOString() } : product,
      ),
    )
  }

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((product) => product.id !== id))
  }

  const updateStock = (id: string, quantity: number, operation: "add" | "subtract") => {
    setProducts((prev) =>
      prev.map((product) => {
        if (product.id === id) {
          const newStock =
            operation === "add" ? product.currentStock + quantity : Math.max(0, product.currentStock - quantity)
          return {
            ...product,
            currentStock: newStock,
            updatedAt: new Date().toISOString(),
          }
        }
        return product
      }),
    )
  }

  // Funciones para utensilios
  const addUtensil = (utensilData: Omit<Utensil, "id" | "code" | "createdAt" | "updatedAt">) => {
    const code = generateUtensilCode(utensilData.category, utensils)
    const newUtensil: Utensil = {
      ...utensilData,
      id: Date.now().toString(),
      code,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setUtensils((prev) => [...prev, newUtensil])
  }

  const updateUtensil = (id: string, utensilData: Partial<Utensil>) => {
    setUtensils((prev) =>
      prev.map((utensil) =>
        utensil.id === id ? { ...utensil, ...utensilData, updatedAt: new Date().toISOString() } : utensil,
      ),
    )
  }

  const deleteUtensil = (id: string) => {
    setUtensils((prev) => prev.filter((utensil) => utensil.id !== id))
  }

  const updateUtensilQuantity = (id: string, quantity: number, operation: "add" | "subtract") => {
    setUtensils((prev) =>
      prev.map((utensil) => {
        if (utensil.id === id) {
          const newQuantity =
            operation === "add" ? utensil.currentQuantity + quantity : Math.max(0, utensil.currentQuantity - quantity)
          return {
            ...utensil,
            currentQuantity: newQuantity,
            updatedAt: new Date().toISOString(),
          }
        }
        return utensil
      }),
    )
  }

  // Funciones para menú
  const addMenuItem = (menuItemData: Omit<MenuItem, "id" | "createdAt" | "updatedAt">) => {
    const newMenuItem: MenuItem = {
      ...menuItemData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setMenuItems((prev) => [...prev, newMenuItem])
  }

  const updateMenuItem = (id: string, menuItemData: Partial<MenuItem>) => {
    setMenuItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...menuItemData, updatedAt: new Date().toISOString() } : item)),
    )
  }

  const deleteMenuItem = (id: string) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== id))
  }

  // Funciones para ventas
  const addSale = (saleData: Omit<Sale, "id" | "saleNumber" | "createdAt" | "updatedAt">) => {
    const saleNumber = generateSaleNumber(sales)
    const newSale: Sale = {
      ...saleData,
      id: Date.now().toString(),
      saleNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Descontar ingredientes del inventario automáticamente
    if (saleData.status === "completed") {
      saleData.items.forEach((saleItem) => {
        const menuItem = menuItems.find((m) => m.id === saleItem.menuItemId)
        if (menuItem) {
          menuItem.recipe.forEach((ingredient) => {
            const totalQuantityNeeded = ingredient.quantity * saleItem.quantity
            updateStock(ingredient.productId, totalQuantityNeeded, "subtract")
          })
        }
      })
    }

    setSales((prev) => [...prev, newSale])
  }

  const updateSale = (id: string, saleData: Partial<Sale>) => {
    setSales((prev) =>
      prev.map((sale) => (sale.id === id ? { ...sale, ...saleData, updatedAt: new Date().toISOString() } : sale)),
    )
  }

  const deleteSale = (id: string) => {
    setSales((prev) => prev.filter((sale) => sale.id !== id))
  }

  // Agregar las funciones de caja registradora antes del return

  // Obtener la caja registradora actual (abierta)
  const currentCashRegister = cashRegisters.find((cr) => cr.status === "open") || null

  // Funciones para caja registradora
  const openCashRegister = (openingAmount: number, openedBy: string, notes?: string) => {
    // Verificar que no haya una caja abierta
    if (currentCashRegister) {
      alert("Ya hay una caja registradora abierta. Ciérrala antes de abrir una nueva.")
      return
    }

    const today = new Date().toISOString().slice(0, 10)
    const newCashRegister: CashRegister = {
      id: Date.now().toString(),
      date: today,
      openingAmount,
      openingTime: new Date().toISOString(),
      status: "open",
      openedBy,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setCashRegisters((prev) => [...prev, newCashRegister])

    // Agregar movimiento de apertura
    addCashMovement({
      cashRegisterId: newCashRegister.id,
      type: "deposit",
      amount: openingAmount,
      description: "Apertura de caja",
      category: "Apertura",
    })
  }

  const closeCashRegister = (closingAmount: number, closedBy: string, notes?: string) => {
    if (!currentCashRegister) {
      alert("No hay una caja registradora abierta para cerrar")
      return
    }

    // Calcular el monto esperado basado en ventas y movimientos
    const movements = getCashMovements(currentCashRegister.id)
    const expectedAmount = movements.reduce((total, movement) => {
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

    const difference = closingAmount - expectedAmount

    setCashRegisters((prev) =>
      prev.map((cr) =>
        cr.id === currentCashRegister.id
          ? {
              ...cr,
              closingAmount,
              closingTime: new Date().toISOString(),
              expectedAmount,
              difference,
              status: "closed" as const,
              closedBy,
              notes: notes || cr.notes,
              updatedAt: new Date().toISOString(),
            }
          : cr,
      ),
    )

    // Generar reporte diario automáticamente
    setTimeout(() => {
      generateDailyReport(currentCashRegister.date)
    }, 1000)
  }

  const addCashMovement = (movementData: Omit<CashMovement, "id" | "createdAt">) => {
    const newMovement: CashMovement = {
      ...movementData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    setCashMovements((prev) => [...prev, newMovement])
  }

  const getCashMovements = (cashRegisterId: string) => {
    return cashMovements.filter((movement) => movement.cashRegisterId === cashRegisterId)
  }

  // Funciones para reportes diarios
  const generateDailyReport = (date: string): DailyReport | null => {
    const dayRegister = cashRegisters.find((cr) => cr.date === date && cr.status === "closed")
    if (!dayRegister) return null

    const daySales = sales.filter((s) => s.createdAt.slice(0, 10) === date && s.status === "completed")

    const dayMovements = getCashMovements(dayRegister.id)
    const expenses = dayMovements.filter((m) => m.type === "expense").reduce((sum, m) => sum + m.amount, 0)

    const totalSales = daySales.reduce((sum, s) => sum + s.total, 0)
    const netIncome = totalSales - expenses

    // Ventas por categoría
    const salesByCategory = daySales.reduce(
      (acc, sale) => {
        sale.items.forEach((item) => {
          const menuItem = menuItems.find((m) => m.id === item.menuItemId)
          const category = menuItem?.category || "Sin categoría"

          if (!acc[category]) {
            acc[category] = { quantity: 0, revenue: 0 }
          }
          acc[category].quantity += item.quantity
          acc[category].revenue += item.total
        })
        return acc
      },
      {} as Record<string, { quantity: number; revenue: number }>,
    )

    // Productos más vendidos
    const productSales = daySales.reduce(
      (acc, sale) => {
        sale.items.forEach((item) => {
          if (!acc[item.menuItemId]) {
            acc[item.menuItemId] = {
              name: item.menuItemName,
              quantity: 0,
              revenue: 0,
            }
          }
          acc[item.menuItemId].quantity += item.quantity
          acc[item.menuItemId].revenue += item.total
        })
        return acc
      },
      {} as Record<string, { name: string; quantity: number; revenue: number }>,
    )

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)

    // Métodos de pago
    const paymentMethods = daySales.reduce(
      (acc, sale) => {
        acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + sale.total
        return acc
      },
      {} as Record<string, number>,
    )

    const report: DailyReport = {
      id: Date.now().toString(),
      date,
      cashRegisterId: dayRegister.id,
      openingAmount: dayRegister.openingAmount,
      closingAmount: dayRegister.closingAmount || 0,
      totalSales,
      totalExpenses: expenses,
      netIncome,
      salesByCategory,
      topProducts,
      paymentMethods,
      status: "pending",
      createdAt: new Date().toISOString(),
    }

    setDailyReports((prev) => {
      const existing = prev.find((r) => r.date === date)
      if (existing) {
        return prev.map((r) => (r.date === date ? report : r))
      }
      return [...prev, report]
    })

    return report
  }

  const sendDailyReport = async (reportId: string, email: string): Promise<boolean> => {
    // Simular envío de email (en producción usarías un servicio real)
    try {
      // Aquí integrarías con un servicio de email como SendGrid, Nodemailer, etc.
      console.log(`Enviando reporte ${reportId} a ${email}`)

      // Simular delay de envío
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Actualizar estado del reporte
      setDailyReports((prev) =>
        prev.map((report) =>
          report.id === reportId
            ? {
                ...report,
                status: "sent" as const,
                emailSentAt: new Date().toISOString(),
              }
            : report,
        ),
      )

      return true
    } catch (error) {
      console.error("Error enviando reporte:", error)

      setDailyReports((prev) =>
        prev.map((report) => (report.id === reportId ? { ...report, status: "failed" as const } : report)),
      )

      return false
    }
  }

  // Actualizar el return del provider para incluir las nuevas funciones

  return (
    <InventoryContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        updateStock,
        utensils,
        addUtensil,
        updateUtensil,
        deleteUtensil,
        updateUtensilQuantity,
        menuItems,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        sales,
        addSale,
        updateSale,
        deleteSale,
        // ... todas las propiedades existentes ...
        cashRegisters,
        currentCashRegister,
        openCashRegister,
        closeCashRegister,
        addCashMovement,
        getCashMovements,
        dailyReports,
        generateDailyReport,
        sendDailyReport,
        loading,
      }}
    >
      {children}
    </InventoryContext.Provider>
  )
}
