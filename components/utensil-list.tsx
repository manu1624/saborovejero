"use client"

import { useState } from "react"
import { Edit, Trash2, Wrench, AlertTriangle, Hash, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useInventory, type Utensil } from "@/components/inventory-provider"
import { UtensilForm } from "@/components/utensil-form"

interface UtensilListProps {
  utensils: Utensil[]
  onSelectUtensil: (utensilId: string) => void
}

const categories = ["Cocina", "Servicio", "Mobiliario", "Limpieza", "Equipos"]

const conditionColors = {
  excelente: "bg-green-100 text-green-800",
  bueno: "bg-blue-100 text-blue-800",
  regular: "bg-yellow-100 text-yellow-800",
  malo: "bg-orange-100 text-orange-800",
  dañado: "bg-red-100 text-red-800",
}

export function UtensilList({ utensils, onSelectUtensil }: UtensilListProps) {
  const { deleteUtensil } = useInventory()
  const [editingUtensil, setEditingUtensil] = useState<string | null>(null)

  const handleDelete = (utensilId: string, utensilName: string) => {
    if (confirm(`¿Estás seguro de que quieres eliminar "${utensilName}"?`)) {
      deleteUtensil(utensilId)
    }
  }

  const getQuantityStatus = (utensil: Utensil) => {
    if (utensil.currentQuantity === 0) {
      return { status: "out", label: "Sin Stock", color: "bg-red-100 text-red-800" }
    } else if (utensil.currentQuantity <= utensil.minQuantity) {
      return { status: "low", label: "Cantidad Baja", color: "bg-yellow-100 text-yellow-800" }
    }
    return { status: "ok", label: "Disponible", color: "bg-green-100 text-green-800" }
  }

  if (utensils.length === 0) {
    return (
      <div className="text-center py-12">
        <Wrench className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay utensilios</h3>
        <p className="text-gray-500">No se encontraron utensilios que coincidan con los filtros.</p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Utensilio</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {utensils.map((utensil) => {
              const quantityStatus = getQuantityStatus(utensil)
              return (
                <TableRow key={utensil.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-gray-400" />
                      <span className="font-mono text-sm font-medium text-purple-600">{utensil.code}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">{utensil.name}</div>
                      <div className="text-sm text-gray-500">Mín: {utensil.minQuantity} unidades</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {utensil.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <span className="text-sm">{utensil.location}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{utensil.currentQuantity} unidades</div>
                    <Badge className={quantityStatus.color} variant="secondary">
                      {quantityStatus.status === "low" && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {quantityStatus.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={conditionColors[utensil.condition]} variant="secondary">
                      {utensil.condition.charAt(0).toUpperCase() + utensil.condition.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">${utensil.purchasePrice.toLocaleString("es-CO")}</div>
                      <div className="text-xs text-gray-500">por unidad</div>
                      <div className="text-sm font-semibold text-green-600">
                        Total: ${(utensil.currentQuantity * utensil.purchasePrice).toLocaleString("es-CO")}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingUtensil(utensil.id)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(utensil.id, utensil.name)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {editingUtensil && (
        <UtensilForm onClose={() => setEditingUtensil(null)} categories={categories} utensilId={editingUtensil} />
      )}
    </>
  )
}
