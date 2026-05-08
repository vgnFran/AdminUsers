# Sistema de Administracion de Usuarios

Aplicacion web para administrar usuarios y roles. Incluye login con sesiones, panel privado, CRUD de usuarios, CRUD de roles, busqueda, estadisticas y validaciones de servidor.

## Requisitos

- Node.js 18 o superior
- MySQL 5.7 o superior
- npm

## Instalacion

Instalar dependencias:

```bash
npm install
```

Crear un archivo `.env` en la raiz del proyecto con esta configuracion:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=pp2-admin-users
SESSION_SECRET=secretpp2users
```

Modificar `DB_USER`, `DB_PASS` y `DB_HOST` si tu instalacion de MySQL usa otros datos.

## Base de datos

Importar el archivo `database.sql` incluido en la raiz del proyecto.

Desde MySQL:

```sql
SOURCE ruta/al/proyecto/database.sql;
```

O desde consola:

```bash
mysql -u root -p < database.sql
```

El script crea:

- Base de datos `pp2-admin-users`
- Tabla `roles`
- Tabla `users`
- Relaciones, claves unicas y clave foranea
- Roles iniciales: `Admin`, `Operador`, `Viewer`
- Usuario administrador inicial

## Usuario inicial

```txt
Email: admin@admin.com
Password: Admin1234
```

## Ejecucion

Ejecutar:

```bash
npm start
```

Luego abrir:

```txt
http://localhost:3000
```

## Estructura principal

```txt
src/
  app.js
  config/
    database.js
  controllers/
    authController.js
    usersContoller.js
    rolesController.js
  middlewares/
    authMiddleware.js
  models/
    usersModel.js
    rolesModel.js
  routes/
    usersRouter.js
    rolesRouter.js
  public/
    index.html
    views/dashboard.html
    js/
      login.js
      dashboard.js
      users.js
      roles.js
database.sql
README.md
```

## Funcionalidades

- Login de administrador
- Cierre de sesion
- Proteccion de endpoints mediante sesion
- Dashboard con estadisticas
- Listado, busqueda, alta, edicion, detalle y eliminacion de usuarios
- Listado, alta, edicion y eliminacion de roles
- Validacion de roles activos al asignar usuarios
- Validacion de unicidad de roles
- Validacion de email, DNI y campos obligatorios en usuarios
- Passwords guardadas con bcrypt

## Notas

- Solo los usuarios con rol `Admin` pueden acceder al sistema.
- No se puede eliminar un rol que tenga usuarios asignados.
- No se puede eliminar el usuario actualmente logueado.
- Los roles inactivos no se pueden asignar a nuevos usuarios.
