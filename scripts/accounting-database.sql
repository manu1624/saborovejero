-- Crear tablas para el módulo de contabilidad y caja registradora

-- Tabla para registros de caja
CREATE TABLE IF NOT EXISTS cash_registers (
    id VARCHAR(50) PRIMARY KEY,
    date DATE NOT NULL,
    opening_amount DECIMAL(10,2) NOT NULL,
    opening_time TIMESTAMP NOT NULL,
    closing_amount DECIMAL(10,2),
    closing_time TIMESTAMP,
    expected_amount DECIMAL(10,2),
    difference DECIMAL(10,2),
    status ENUM('open', 'closed') NOT NULL DEFAULT 'open',
    opened_by VARCHAR(100) NOT NULL,
    closed_by VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla para movimientos de caja
CREATE TABLE IF NOT EXISTS cash_movements (
    id VARCHAR(50) PRIMARY KEY,
    cash_register_id VARCHAR(50) NOT NULL,
    type ENUM('income', 'expense', 'withdrawal', 'deposit') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    related_sale_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cash_register_id) REFERENCES cash_registers(id) ON DELETE CASCADE,
    FOREIGN KEY (related_sale_id) REFERENCES sales(id) ON DELETE SET NULL
);

-- Tabla para reportes diarios
CREATE TABLE IF NOT EXISTS daily_reports (
    id VARCHAR(50) PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    cash_register_id VARCHAR(50) NOT NULL,
    opening_amount DECIMAL(10,2) NOT NULL,
    closing_amount DECIMAL(10,2) NOT NULL,
    total_sales DECIMAL(10,2) NOT NULL,
    total_expenses DECIMAL(10,2) NOT NULL,
    net_income DECIMAL(10,2) NOT NULL,
    sales_by_category JSON,
    top_products JSON,
    payment_methods JSON,
    status ENUM('pending', 'sent', 'failed') NOT NULL DEFAULT 'pending',
    email_sent_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cash_register_id) REFERENCES cash_registers(id) ON DELETE CASCADE
);

-- Índices para optimizar consultas
CREATE INDEX idx_cash_registers_date ON cash_registers(date);
CREATE INDEX idx_cash_registers_status ON cash_registers(status);
CREATE INDEX idx_cash_movements_register ON cash_movements(cash_register_id);
CREATE INDEX idx_cash_movements_type ON cash_movements(type);
CREATE INDEX idx_daily_reports_date ON daily_reports(date);
CREATE INDEX idx_daily_reports_status ON daily_reports(status);

-- Insertar datos de ejemplo
INSERT INTO cash_registers (id, date, opening_amount, opening_time, status, opened_by, notes) VALUES
('cr_001', CURDATE(), 50000.00, NOW(), 'open', 'Admin', 'Apertura inicial del sistema');

INSERT INTO cash_movements (id, cash_register_id, type, amount, description, category) VALUES
('cm_001', 'cr_001', 'deposit', 50000.00, 'Apertura de caja', 'Apertura');
