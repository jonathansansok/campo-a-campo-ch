-- Ajuste a la letra del challenge: nombre VARCHAR(255), descripcion TEXT,
-- created_at / updated_at como TIMESTAMP con defaults en la base.
-- Escrita a mano: prisma queria dropear y recrear las columnas de fecha
-- (perdia datos) y ademas no genera el ON UPDATE CURRENT_TIMESTAMP.
ALTER TABLE `productos`
    MODIFY `nombre` VARCHAR(255) NOT NULL,
    MODIFY `descripcion` TEXT NULL,
    CHANGE `creadoEn` `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHANGE `actualizadoEn` `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
