-- Script para configuración de integración con Epson TM-T20III
-- Ejecutar después de tener la base de datos principal configurada

-- Tabla para configuración de impresoras POS
CREATE TABLE IF NOT EXISTS pos_printers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    connection_type ENUM('usb', 'ethernet', 'bluetooth', 'serial') NOT NULL,
    connection_string VARCHAR(200) NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    settings JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insertar configuración por defecto para Epson TM-T20III
INSERT INTO pos_printers (id, name, brand, model, connection_type, connection_string, is_active, settings) VALUES
('epson-tm-t20iii-main', 'Epson TM-T20III Principal', 'Epson', 'TM-T20III', 'usb', 'USB\\VID_04B8&PID_0202', TRUE, JSON_OBJECT(
    'autoOpenDrawer', true,
    'autoCut', true,
    'buzzerEnabled', true,
    'printLogo', true,
    'paperSaving', false,
    'drawerPin', 'pin2',
    'characterSet', 'PC437_USA',
    'printDensity', 'normal',
    'maxLineWidth', 48,
    'paperWidth', 80
));

-- Tabla para registro de impresiones
CREATE TABLE IF NOT EXISTS print_jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    printer_id VARCHAR(50) NOT NULL,
    job_type ENUM('receipt', 'report', 'test') NOT NULL,
    related_sale_id VARCHAR(50),
    related_cash_register_id VARCHAR(50),
    status ENUM('pending', 'printing', 'completed', 'failed') DEFAULT 'pending',
    print_data JSON,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (printer_id) REFERENCES pos_printers(id),
    FOREIGN KEY (related_sale_id) REFERENCES sales(id),
    FOREIGN KEY (related_cash_register_id) REFERENCES cash_registers(id)
);

-- Tabla para estadísticas de impresión
CREATE TABLE IF NOT EXISTS printer_statistics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    printer_id VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    receipts_printed INT DEFAULT 0,
    reports_printed INT DEFAULT 0,
    test_prints INT DEFAULT 0,
    failed_prints INT DEFAULT 0,
    paper_cuts INT DEFAULT 0,
    drawer_opens INT DEFAULT 0,
    total_print_time_seconds INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (printer_id) REFERENCES pos_printers(id),
    UNIQUE KEY unique_printer_date (printer_id, date)
);

-- Tabla para configuración de recibos personalizados
CREATE TABLE IF NOT EXISTS receipt_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type ENUM('sale', 'refund', 'cash_register_report', 'daily_report') NOT NULL,
    printer_brand VARCHAR(50) NOT NULL,
    template_data JSON NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insertar plantilla por defecto para recibos de venta con Epson TM-T20III
INSERT INTO receipt_templates (name, type, printer_brand, template_data, is_active) VALUES
('Recibo Venta Epson TM-T20III', 'sale', 'Epson', JSON_OBJECT(
    'header', JSON_OBJECT(
        'showLogo', true,
        'businessName', 'PIZZERÍA MARULANDA',
        'businessSubtitle', '🍕 Auténtica Pizza Italiana 🍕',
        'businessNIT', '123.456.789-0',
        'businessPhone', '(601) 234-5678',
        'businessAddress', 'Cra 15 #85-32, Bogotá',
        'fontSize', 'normal'
    ),
    'body', JSON_OBJECT(
        'showItemDetails', true,
        'showCustomerInfo', true,
        'showPaymentMethod', true,
        'showChange', true,
        'itemFormat', 'detailed'
    ),
    'footer', JSON_OBJECT(
        'thankYouMessage', '¡Gracias por su compra!',
        'returnMessage', 'Vuelva pronto',
        'socialMedia', '@PizzeriaMarulanda',
        'showQRCode', true,
        'feedLines', 3
    ),
    'formatting', JSON_OBJECT(
        'separatorChar', '=',
        'lineWidth', 48,
        'boldTitles', true,
        'centerHeader', true,
        'centerFooter', true
    )
), TRUE);

-- Insertar plantilla para reportes de caja
INSERT INTO receipt_templates (name, type, printer_brand, template_data, is_active) VALUES
('Reporte Caja Epson TM-T20III', 'cash_register_report', 'Epson', JSON_OBJECT(
    'header', JSON_OBJECT(
        'title', 'REPORTE DE CAJA',
        'businessName', 'PIZZERÍA MARULANDA',
        'fontSize', 'large'
    ),
    'body', JSON_OBJECT(
        'showOpeningInfo', true,
        'showSalesSummary', true,
        'showPaymentMethods', true,
        'showExpenses', true,
        'showClosingInfo', true,
        'showDifference', true
    ),
    'footer', JSON_OBJECT(
        'generatedMessage', 'Reporte generado automáticamente',
        'showTimestamp', true,
        'feedLines', 4
    )
), TRUE);

-- Índices para optimizar consultas
CREATE INDEX idx_print_jobs_printer_status ON print_jobs(printer_id, status);
CREATE INDEX idx_print_jobs_created_at ON print_jobs(created_at);
CREATE INDEX idx_printer_statistics_date ON printer_statistics(date);
CREATE INDEX idx_receipt_templates_type_brand ON receipt_templates(type, printer_brand);

-- Vista para estadísticas de impresión por día
CREATE VIEW daily_printer_stats AS
SELECT 
    ps.printer_id,
    pp.name as printer_name,
    ps.date,
    ps.receipts_printed,
    ps.reports_printed,
    ps.test_prints,
    ps.failed_prints,
    ps.paper_cuts,
    ps.drawer_opens,
    ps.total_print_time_seconds,
    ROUND(ps.total_print_time_seconds / 60, 2) as total_print_time_minutes
FROM printer_statistics ps
JOIN pos_printers pp ON ps.printer_id = pp.id
ORDER BY ps.date DESC, pp.name;

-- Procedimiento para registrar estadística de impresión
DELIMITER //
CREATE PROCEDURE RegisterPrintStatistic(
    IN p_printer_id VARCHAR(50),
    IN p_job_type ENUM('receipt', 'report', 'test'),
    IN p_success BOOLEAN,
    IN p_print_time_seconds INT
)
BEGIN
    DECLARE current_date DATE DEFAULT CURDATE();
    
    -- Insertar o actualizar estadísticas del día
    INSERT INTO printer_statistics (
        printer_id, 
        date, 
        receipts_printed, 
        reports_printed, 
        test_prints, 
        failed_prints,
        total_print_time_seconds
    ) VALUES (
        p_printer_id,
        current_date,
        CASE WHEN p_job_type = 'receipt' AND p_success THEN 1 ELSE 0 END,
        CASE WHEN p_job_type = 'report' AND p_success THEN 1 ELSE 0 END,
        CASE WHEN p_job_type = 'test' AND p_success THEN 1 ELSE 0 END,
        CASE WHEN NOT p_success THEN 1 ELSE 0 END,
        CASE WHEN p_success THEN p_print_time_seconds ELSE 0 END
    )
    ON DUPLICATE KEY UPDATE
        receipts_printed = receipts_printed + CASE WHEN p_job_type = 'receipt' AND p_success THEN 1 ELSE 0 END,
        reports_printed = reports_printed + CASE WHEN p_job_type = 'report' AND p_success THEN 1 ELSE 0 END,
        test_prints = test_prints + CASE WHEN p_job_type = 'test' AND p_success THEN 1 ELSE 0 END,
        failed_prints = failed_prints + CASE WHEN NOT p_success THEN 1 ELSE 0 END,
        total_print_time_seconds = total_print_time_seconds + CASE WHEN p_success THEN p_print_time_seconds ELSE 0 END,
        updated_at = CURRENT_TIMESTAMP;
END //
DELIMITER ;

-- Función para obtener configuración de impresora activa
DELIMITER //
CREATE FUNCTION GetActivePrinter() RETURNS VARCHAR(50)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE printer_id VARCHAR(50);
    
    SELECT id INTO printer_id 
    FROM pos_printers 
    WHERE is_active = TRUE 
    LIMIT 1;
    
    RETURN printer_id;
END //
DELIMITER ;

-- Trigger para actualizar timestamp en pos_printers
DELIMITER //
CREATE TRIGGER pos_printers_update_timestamp
    BEFORE UPDATE ON pos_printers
    FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END //
DELIMITER ;

-- Insertar datos de ejemplo para pruebas
INSERT INTO printer_statistics (printer_id, date, receipts_printed, reports_printed, test_prints, failed_prints, paper_cuts, drawer_opens, total_print_time_seconds) VALUES
('epson-tm-t20iii-main', CURDATE(), 0, 0, 0, 0, 0, 0, 0);

-- Comentarios para documentación
ALTER TABLE pos_printers COMMENT = 'Configuración de impresoras POS conectadas al sistema';
ALTER TABLE print_jobs COMMENT = 'Registro de trabajos de impresión enviados a las impresoras';
ALTER TABLE printer_statistics COMMENT = 'Estadísticas diarias de uso de impresoras';
ALTER TABLE receipt_templates COMMENT = 'Plantillas personalizables para diferentes tipos de recibos';
