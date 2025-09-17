-- Crear tabla de productos
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price REAL NOT NULL DEFAULT 0,
    unit TEXT NOT NULL,
    current_stock REAL NOT NULL DEFAULT 0,
    min_stock REAL NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Crear tabla de movimientos de stock (para futuras implementaciones)
CREATE TABLE IF NOT EXISTS stock_movements (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    quantity REAL NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('add', 'subtract')),
    reason TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements(created_at);

-- Insertar datos de ejemplo
INSERT OR IGNORE INTO products (id, name, category, price, unit, current_stock, min_stock, created_at, updated_at) VALUES
('1', 'Harina de Trigo', 'Pizzería', 3500, 'kg', 25, 5, datetime('now'), datetime('now')),
('2', 'Queso Mozzarella', 'Pizzería', 8500, 'kg', 10, 2, datetime('now'), datetime('now')),
('3', 'Salsa de Tomate', 'Pizzería', 2800, 'kg', 15, 3, datetime('now'), datetime('now')),
('4', 'Jamón', 'Pizzería', 12000, 'kg', 5, 1, datetime('now'), datetime('now')),
('5', 'Pasta para Lasaña', 'Lasaña', 4200, 'kg', 8, 2, datetime('now'), datetime('now')),
('6', 'Carne Molida', 'Lasaña', 15000, 'kg', 6, 1, datetime('now'), datetime('now')),
('7', 'Café Colombiano', 'Aromáticas / Cafés', 12000, 'kg', 5, 1, datetime('now'), datetime('now')),
('8', 'Azúcar', 'Aromáticas / Cafés', 2500, 'kg', 20, 5, datetime('now'), datetime('now')),
('9', 'Frutas Mixtas', 'Ensaladas de frutas + helados', 8000, 'kg', 12, 3, datetime('now'), datetime('now')),
('10', 'Helado de Vainilla', 'Ensaladas de frutas + helados', 18000, 'l', 4, 1, datetime('now'), datetime('now')),
('11', 'Cerveza', 'Micheladas / Cócteles', 2800, 'unidad', 48, 12, datetime('now'), datetime('now')),
('12', 'Limones', 'Micheladas / Cócteles', 3500, 'kg', 8, 2, datetime('now'), datetime('now'));
