import pool from '../config/database.js'

export class UserModel {

    static async getById(id) {
        const query = `
            select u.id, u.nombre, u.email, u.password_hash, u.dni, u.fecha_nacimiento, u.rol_id, u.domicilio, u.codigo_postal, u.observacion, u.activo, u.fecha_alta, r.nombre as rol_nombre
            from users u
            join roles r on u.rol_id = r.id 
            where u.id= ?
        `
        const [rows] = await pool.execute(query, [id])
        return rows[0]
    }

    static async getUserByEmail(email){
        const query = `
            select u.id, u.nombre, u.email, u.password_hash, u.activo, r.nombre as rol_nombre
            from users u 
            join roles r on u.rol_id = r.id 
            where u.email = ?
        `
        const [rows] = await pool.execute(query, [email])
        return rows[0]
    }

    static async getUserByEmailOrDni(email, dni){
        const query = `
            select id 
            from users
            where email = ? or dni = ? 
            limit 1
        `
        const [rows] = await pool.execute(query, [email, dni])
        return rows[0]
    }

    static async getOthersUseraByEmailOrDni(email, dni, id){
        const query = `
            select id
            from users
            where (email = ? or dni = ?)
            and id <> ?
            limit 1
        `
        const [rows] = await pool.execute(query, [email, dni, id])
        return rows[0]
    }

    static async getAllUsers() {
        const query = `
            select u.id, u.nombre, u.email, u.dni, r.nombre as rol_nombre, u.activo, u.fecha_alta 
            from users u 
            join roles r ON u.rol_id = r.id
        `
        const [rows] = await pool.execute(query)
        return rows
    }

    static async getUserByFilter(filter) {
        const query = `
            SELECT u.id, u.nombre, u.email, u.dni, r.nombre as rol_nombre, u.activo, u.fecha_alta 
            FROM users u 
            JOIN roles r ON u.rol_id = r.id
            WHERE u.nombre LIKE ? 
            OR u.email LIKE ? 
            OR u.dni LIKE ?
        `
        const like = `%${filter}%`
        const [rows] = await pool.execute(query, [like, like, like])
        return rows
    }

    static async newUser(userData){
        const query = `
            insert into users (nombre, email, password_hash, dni, fecha_nacimiento, rol_id, domicilio, codigo_postal, observacion, activo)
            values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)            
        `
        const values = [
            userData.name,
            userData.email,
            userData.passwordHash,
            userData.dni,
            userData.date,
            userData.rol_id,
            userData.adress,
            userData.cp,
            userData.obs,
            userData.active
        ]

        try {
            const [result] = await pool.execute(query, values)
            return result
        } catch (error) {
            console.error("Error al crear usuario en el modelo:", error)
            throw error 
        }

    }

    static async deleteUser(id) {
        const query = "delete from users where id = ?"
    
        try {
            const [result] = await pool.execute(query, [id])
            return result

        } catch (error) {
            console.error("Error al eliminar usuario:", error)
            throw error
        }
    }

    static async updateUser(id, data) {

        const query = `
            update users set 
                nombre = ?, 
                email = ?, 
                dni = ?, 
                password_hash = IFNULL(?, password_hash), 
                fecha_nacimiento = ?, 
                rol_id = ?, 
                domicilio = ?, 
                codigo_postal = ?, 
                observacion = ?, 
                activo = ?
            WHERE id = ?
        `
        const values = [
            data.nombre,
            data.email,
            data.dni,
            data.passHash, 
            data.date,
            data.rol,
            data.adress,
            data.cp,
            data.obs,
            data.active,
            id
        ]

        return await pool.execute(query, values)
    } 

    static async getStats() {

        const query = `
        select 
            count(*) as cant_total,
            sum(activo=1) as cant_activos,
            sum(activo=0) as cant_inactivos,
            (select count(*) from roles) as cant_roles
        from users
        `
        const [rows] = await pool.execute(query)
        return rows[0]
    }

}
