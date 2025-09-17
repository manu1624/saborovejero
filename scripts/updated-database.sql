-- Actualizar tabla de productos con códigos
DROP TABLE IF EXISTS products;
CREATE TABLE products (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price REAL NOT NULL DEFAULT 0,
    unit TEXT NOT NULL,
    current_stock REAL NOT NULL DEFAULT 0,
    min_stock REAL NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Crear tabla de utensilios
CREATE TABLE IF NOT EXISTS utensils (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    purchase_price REAL NOT NULL DEFAULT 0,
    current_quantity INTEGER NOT NULL DEFAULT 0,
    min_quantity INTEGER NOT NULL DEFAULT 0,
    condition TEXT NOT NULL CHECK (condition IN ('excelente', 'bueno', 'regular', 'malo', 'dañado')),
    location TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Crear tabla de movimientos de stock
CREATE TABLE IF NOT EXISTS stock_movements (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    quantity REAL NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('add', 'subtract')),
    reason TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
);

-- Crear tabla de movimientos de utensilios
CREATE TABLE IF NOT EXISTS utensil_movements (
    id TEXT PRIMARY KEY,
    utensil_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('add', 'subtract')),
    reason TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (utensil_id) REFERENCES utensils (id) ON DELETE CASCADE
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_code ON products(code);
CREATE INDEX IF NOT EXISTS idx_utensils_category ON utensils(category);
CREATE INDEX IF NOT EXISTS idx_utensils_code ON utensils(code);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_utensil_movements_utensil_id ON utensil_movements(utensil_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_utensil_movements_created_at ON utensil_movements(created_at);

-- Insertar productos de ejemplo con códigos
INSERT OR IGNORE INTO products (id, code, name, category, price, unit, current_stock, min_stock, created_at, updated_at) VALUES
('1', 'PIZ-001', 'Harina de Trigo', 'Pizzería', 3500, 'kg', 25, 5, datetime('now'), datetime('now')),
('2', 'PIZ-002', 'Queso Mozzarella', 'Pizzería', 8500, 'kg', 10, 2, datetime('now'), datetime('now')),
('3', 'PIZ-003', 'Salsa de Tomate', 'Pizzería', 2800, 'kg', 15, 3, datetime('now'), datetime('now')),
('4', 'PIZ-004', 'Jamón', 'Pizzería', 12000, 'kg', 5, 1, datetime('now'), datetime('now')),
('5', 'PIZ-005', 'Pepperoni', 'Pizzería', 15000, 'kg', 3, 1, datetime('now'), datetime('now')),
('6', 'LAS-001', 'Pasta para Lasaña', 'Lasaña', 4200, 'kg', 8, 2, datetime('now'), datetime('now')),
('7', 'LAS-002', 'Carne Molida', 'Lasaña', 15000, 'kg', 6, 1, datetime('now'), datetime('now')),
('8', 'LAS-003', 'Queso Ricotta', 'Lasaña', 9500, 'kg', 4, 1, datetime('now'), datetime('now')),
('9', 'CAF-001', 'Café Colombiano', 'Aromáticas / Cafés', 12000, 'kg', 5, 1, datetime('now'), datetime('now')),
('10', 'CAF-002', 'Azúcar', 'Aromáticas / Cafés', 2500, 'kg', 20, 5, datetime('now'), datetime('now')),
('11', 'CAF-003', 'Leche', 'Aromáticas / Cafés', 3200, 'l', 15, 3, datetime('now'), datetime('now')),
('12', 'ENS-001', 'Frutas Mixtas', 'Ensaladas de frutas + helados', 8000, 'kg', 12, 3, datetime('now'), datetime('now')),
('13', 'ENS-002', 'Helado de Vainilla', 'Ensaladas de frutas + helados', 18000, 'l', 4, 1, datetime('now'), datetime('now')),
('14', 'ENS-003', 'Crema Chantilly', 'Ensaladas de frutas + helados', 6500, 'l', 6, 2, datetime('now'), datetime('now')),
('15', 'MIC-001', 'Cerveza', 'Micheladas / Cócteles', 2800, 'unidad', 48, 12, datetime('now'), datetime('now')),
('16', 'MIC-002', 'Limones', 'Micheladas / Cócteles', 3500, 'kg', 8, 2, datetime('now'), datetime('now')),
('17', 'MIC-003', 'Sal', 'Micheladas / Cócteles', 1200, 'kg', 5, 1, datetime('now'), datetime('now'));

-- Insertar utensilios de ejemplo con códigos
INSERT OR IGNORE INTO utensils (id, code, name, category, purchase_price, current_quantity, min_quantity, condition, location, created_at, updated_at) VALUES
('1', 'EQU-001', 'Horno Industrial', 'Equipos', 2500000, 1, 1, 'excelente', 'Cocina Principal', datetime('now'), datetime('now')),
('2', 'EQU-002', 'Refrigerador Comercial', 'Equipos', 1800000, 2, 1, 'bueno', 'Cocina Principal', datetime('now'), datetime('now')),
('3', 'EQU-003', 'Batidora Industrial', 'Equipos', 450000, 1, 1, 'bueno', 'Área de Preparación', datetime('now'), datetime('now')),
('4', 'COC-001', 'Cuchillos de Chef', 'Cocina', 85000, 6, 4, 'bueno', 'Estación de Corte', datetime('now'), datetime('now')),
('5', 'COC-002', 'Tablas de Corte', 'Cocina', 25000, 8, 4, 'regular', 'Estación de Corte', datetime('now'), datetime('now')),
('6', 'COC-003', 'Ollas Grandes', 'Cocina', 120000, 4, 2, 'bueno', 'Área de Cocción', datetime('now'), datetime('now')),
('7', 'SER-001', 'Platos para Pizza', 'Servicio', 15000, 24, 12, 'bueno', 'Área de Servicio', datetime('now'), datetime('now')),
('8', 'SER-002', 'Vasos de Vidrio', 'Servicio', 8000, 36, 18, 'bueno', 'Área de Servicio', datetime('now'), datetime('now')),
('9', 'SER-003', 'Cubiertos', 'Servicio', 45000, 48, 24, 'bueno', 'Área de Servicio', datetime('now'), datetime('now')),
('10', 'MOB-001', 'Sillas de Comedor', 'Mobiliario', 85000, 16, 12, 'bueno', 'Área de Clientes', datetime('now'), datetime('now')),
('11', 'MOB-002', 'Mesas de Comedor', 'Mobiliario', 150000, 6, 4, 'bueno', 'Área de Clientes', datetime('now'), datetime('now')),
('12', 'MOB-003', 'Estantes de Almacenamiento', 'Mobiliario', 180000, 4, 2, 'excelente', 'Bodega', datetime('now'), datetime('now')),
('13', 'LIM-001', 'Traperos', 'Limpieza', 12000, 8, 4, 'regular', 'Área de Limpieza', datetime('now'), datetime('now')),
('14', 'LIM-002', 'Baldes', 'Limpieza', 18000, 6, 3, 'bueno', 'Área de Limpieza', datetime('now'), datetime('now')),
('15', 'LIM-003', 'Paños de Cocina', 'Limpieza', 25000, 20, 10, 'bueno', 'Cocina Principal', datetime('now'), datetime('now'));
