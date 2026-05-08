CREATE DATABASE IF NOT EXISTS `pp2-admin-users`

USE `pp2-admin-users`;

CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT NULL,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    CONSTRAINT uq_roles_nombre UNIQUE (nombre)
)

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    dni VARCHAR(20) NOT NULL,
    fecha_nacimiento DATE NULL,
    rol_id INT NOT NULL,
    domicilio VARCHAR(255) NULL,
    codigo_postal VARCHAR(10) NULL,
    observacion TEXT NULL,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    fecha_alta TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT uq_users_dni UNIQUE (dni),
    CONSTRAINT fk_users_roles FOREIGN KEY (rol_id)
        REFERENCES roles(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) 

INSERT INTO roles (id, nombre, descripcion, activo) VALUES
    (1, 'Admin', 'Administrador del sistema con acceso completo.', 1),
    (2, 'Operador', 'Usuario operativo con permisos limitados.', 1),
    (3, 'Viewer', 'Usuario con permisos de solo lectura.', 1);

INSERT INTO users (
    nombre,
    email,
    password_hash,
    dni,
    fecha_nacimiento,
    rol_id,
    domicilio,
    codigo_postal,
    observacion,
    activo
) VALUES (
    'Administrador',
    'admin@admin.com',
    '$2b$10$Sky9oCYOoHOSfRTt2CEptu.KjbWWQ2/uv/pS8vHyp2J0owUiCN52y',
    '00000000',
    NULL,
    1,
    NULL,
    NULL,
    'Usuario administrador inicial. Password inicial: Admin1234',
    1
);
