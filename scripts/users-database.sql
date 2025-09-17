-- Crear tabla de usuarios del sistema
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role ENUM('owner', 'cashier') NOT NULL DEFAULT 'cashier',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    created_by VARCHAR(36) NULL,
    
    INDEX idx_username (username),
    INDEX idx_role (role),
    INDEX idx_active (is_active),
    INDEX idx_email (email),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Crear tabla de sesiones de usuario
CREATE TABLE IF NOT EXISTS user_sessions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    INDEX idx_user_id (user_id),
    INDEX idx_session_token (session_token),
    INDEX idx_expires_at (expires_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Crear tabla de log de actividades de usuario
CREATE TABLE IF NOT EXISTS user_activity_log (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    action VARCHAR(100) NOT NULL,
    module VARCHAR(50) NOT NULL,
    details JSON,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_module (module),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insertar usuario propietario por defecto
INSERT INTO users (id, username, password_hash, full_name, email, role, is_active) VALUES 
('1', 'propietario', '$2b$10$rQZ8kHp.TB.It.NvGLGzUOQQvpHr6Gq8XzE1Kj9QGvQqYvQqYvQqY', 'Propietario Pizzería Marulanda', 'propietario@pizzeriamarulanda.com', 'owner', TRUE)
ON DUPLICATE KEY UPDATE
    full_name = VALUES(full_name),
    email = VALUES(email),
    role = VALUES(role),
    is_active = VALUES(is_active);

-- Insertar cajeros de demostración
INSERT INTO users (id, username, password_hash, full_name, email, role, is_active, created_by) VALUES 
('2', 'cajero1', '$2b$10$rQZ8kHp.TB.It.NvGLGzUOQQvpHr6Gq8XzE1Kj9QGvQqYvQqYvQqY', 'María González', 'maria@pizzeriamarulanda.com', 'cashier', TRUE, '1'),
('3', 'cajero2', '$2b$10$rQZ8kHp.TB.It.NvGLGzUOQQvpHr6Gq8XzE1Kj9QGvQqYvQqYvQqY', 'Carlos Rodríguez', 'carlos@pizzeriamarulanda.com', 'cashier', TRUE, '1')
ON DUPLICATE KEY UPDATE
    full_name = VALUES(full_name),
    email = VALUES(email),
    role = VALUES(role),
    is_active = VALUES(is_active),
    created_by = VALUES(created_by);

-- Crear vista para estadísticas de usuarios
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    role,
    COUNT(*) as total_users,
    SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active_users,
    SUM(CASE WHEN last_login >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as recent_logins
FROM users 
GROUP BY role;

-- Crear procedimiento para limpiar sesiones expiradas
DELIMITER //
CREATE PROCEDURE CleanExpiredSessions()
BEGIN
    DELETE FROM user_sessions WHERE expires_at < NOW();
    SELECT ROW_COUNT() as deleted_sessions;
END //
DELIMITER ;

-- Crear evento para limpiar sesiones automáticamente (cada hora)
CREATE EVENT IF NOT EXISTS clean_expired_sessions
ON SCHEDULE EVERY 1 HOUR
DO CALL CleanExpiredSessions();

-- Crear función para registrar actividad de usuario
DELIMITER //
CREATE PROCEDURE LogUserActivity(
    IN p_user_id VARCHAR(36),
    IN p_action VARCHAR(100),
    IN p_module VARCHAR(50),
    IN p_details JSON,
    IN p_ip_address VARCHAR(45)
)
BEGIN
    INSERT INTO user_activity_log (user_id, action, module, details, ip_address)
    VALUES (p_user_id, p_action, p_module, p_details, p_ip_address);
END //
DELIMITER ;

-- Crear trigger para actualizar last_login automáticamente
DELIMITER //
CREATE TRIGGER update_last_login
    AFTER INSERT ON user_sessions
    FOR EACH ROW
BEGIN
    UPDATE users 
    SET last_login = NOW() 
    WHERE id = NEW.user_id;
END //
DELIMITER ;

-- Comentarios sobre el sistema de roles
/*
SISTEMA DE ROLES PIZZERÍA MARULANDA:

1. PROPIETARIO (owner):
   - Acceso completo a todos los módulos
   - Puede gestionar usuarios (crear, editar, eliminar cajeros)
   - Ve precios, costos, márgenes y reportes financieros
   - Puede crear, editar y eliminar productos y configuraciones

2. CAJERO (cashier):
   - Acceso a: caja, ventas, menú, productos (solo consulta)
   - NO ve precios ni información financiera de productos
   - Solo ve cantidades de stock y disponibilidad
   - Recibe alertas automáticas de stock bajo y productos agotados
   - NO puede editar productos, precios ni configuraciones del sistema
   - Puede registrar ventas y manejar caja

CARACTERÍSTICAS ESPECIALES PARA CAJEROS:
- Vista de productos sin precios (solo cantidades)
- Alertas automáticas al iniciar sesión
- Indicadores visuales de disponibilidad para ventas
- Recomendaciones para informar al propietario sobre reabastecimiento

CONTRASEÑA PARA TODOS LOS USUARIOS DEMO: 123456
*/
