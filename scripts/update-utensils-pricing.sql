-- Actualizar la estructura para reflejar que purchase_price es precio por unidad
-- Los datos existentes ya están correctos, solo actualizamos comentarios

-- Comentario para clarificar que purchase_price es precio por unidad
-- En la tabla utensils:
-- purchase_price = precio por unidad individual
-- valor total = purchase_price * current_quantity

-- Ejemplo de consulta para ver valores totales:
SELECT 
    code,
    name,
    current_quantity,
    purchase_price as precio_unitario,
    (current_quantity * purchase_price) as valor_total,
    category,
    location
FROM utensils
ORDER BY (current_quantity * purchase_price) DESC;

-- Consulta para ver inversión total por categoría:
SELECT 
    category,
    COUNT(*) as tipos_utensilios,
    SUM(current_quantity) as cantidad_total,
    SUM(current_quantity * purchase_price) as inversion_total
FROM utensils
GROUP BY category
ORDER BY inversion_total DESC;
