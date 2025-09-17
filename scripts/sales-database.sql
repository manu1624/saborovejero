-- Crear tabla de productos del menú
CREATE TABLE IF NOT EXISTS menu_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT,
    is_available BOOLEAN NOT NULL DEFAULT 1,
    preparation_time INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Crear tabla de recetas (ingredientes por producto del menú)
CREATE TABLE IF NOT EXISTS recipes (
    id TEXT PRIMARY KEY,
    menu_item_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    quantity REAL NOT NULL,
    unit TEXT NOT NULL,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items (id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
);

-- Crear tabla de ventas
CREATE TABLE IF NOT EXISTS sales (
    id TEXT PRIMARY KEY,
    sale_number TEXT UNIQUE NOT NULL,
    subtotal REAL NOT NULL,
    tax REAL NOT NULL DEFAULT 0,
    total REAL NOT NULL,
    payment_method TEXT NOT NULL,
    customer_name TEXT,
    customer_phone TEXT,
    notes TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Crear tabla de items de venta
CREATE TABLE IF NOT EXISTS sale_items (
    id TEXT PRIMARY KEY,
    sale_id TEXT NOT NULL,
    menu_item_id TEXT NOT NULL,
    menu_item_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    total REAL NOT NULL,
    FOREIGN KEY (sale_id) REFERENCES sales (id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items (id)
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(is_available);
CREATE INDEX IF NOT EXISTS idx_recipes_menu_item ON recipes(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_recipes_product ON recipes(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);
CREATE INDEX IF NOT EXISTS idx_sales_number ON sales(sale_number);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_menu_item ON sale_items(menu_item_id);

-- Insertar productos del menú de ejemplo
INSERT OR IGNORE INTO menu_items (id, name, category, price, description, is_available, preparation_time, created_at, updated_at) VALUES
-- Pizzería
('menu_1', 'Pizza Margarita Personal', 'Pizzería', 18000, 'Pizza personal con salsa de tomate, queso mozzarella y albahaca fresca', 1, 15, datetime('now'), datetime('now')),
('menu_2', 'Pizza Pepperoni Mediana', 'Pizzería', 28000, 'Pizza mediana con salsa de tomate, queso mozzarella y pepperoni', 1, 18, datetime('now'), datetime('now')),
('menu_3', 'Pizza Hawaiana Grande', 'Pizzería', 35000, 'Pizza grande con salsa de tomate, queso, jamón y piña', 1, 20, datetime('now'), datetime('now')),

-- Lasaña
('menu_4', 'Lasaña de Carne', 'Lasaña', 22000, 'Lasaña tradicional con carne molida, queso ricotta y salsa boloñesa', 1, 25, datetime('now'), datetime('now')),
('menu_5', 'Lasaña Vegetariana', 'Lasaña', 20000, 'Lasaña con vegetales frescos, queso ricotta y salsa de tomate', 1, 25, datetime('now'), datetime('now')),

-- Aromáticas / Cafés
('menu_6', 'Café Americano', 'Aromáticas / Cafés', 4500, 'Café colombiano preparado en método americano', 1, 5, datetime('now'), datetime('now')),
('menu_7', 'Cappuccino', 'Aromáticas / Cafés', 6500, 'Café espresso con leche vaporizada y espuma de leche', 1, 7, datetime('now'), datetime('now')),
('menu_8', 'Chocolate Caliente', 'Aromáticas / Cafés', 5500, 'Chocolate caliente con leche y crema chantilly', 1, 8, datetime('now'), datetime('now')),

-- Ensaladas de frutas + helados
('menu_9', 'Ensalada de Frutas Mixtas', 'Ensaladas de frutas + helados', 12000, 'Ensalada fresca con frutas de temporada', 1, 10, datetime('now'), datetime('now')),
('menu_10', 'Copa de Helado Vainilla', 'Ensaladas de frutas + helados', 8000, 'Copa de helado de vainilla con frutas y crema', 1, 5, datetime('now'), datetime('now')),

-- Micheladas / Cócteles
('menu_11', 'Michelada Clásica', 'Micheladas / Cócteles', 8500, 'Cerveza con limón, sal y salsas especiales', 1, 5, datetime('now'), datetime('now')),
('menu_12', 'Cóctel de Frutas', 'Micheladas / Cócteles', 12000, 'Cóctel refrescante con frutas naturales', 1, 8, datetime('now'), datetime('now'));

-- Insertar recetas de ejemplo (relación productos del menú con ingredientes)
INSERT OR IGNORE INTO recipes (id, menu_item_id, product_id, quantity, unit) VALUES
-- Pizza Margarita Personal
('recipe_1_1', 'menu_1', '1', 0.15, 'kg'), -- Harina de Trigo
('recipe_1_2', 'menu_1',
