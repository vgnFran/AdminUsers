import pool from '../config/database.js'

export class RolesModel {

    static async getAllRoles() {
        const query = `
            select 
                r.id, 
                r.nombre, 
                r.descripcion, 
                r.activo,
                count(u.id) AS cantidad_usuarios
            from roles r
            left join users u on r.id = u.rol_id
            group by r.id
        `
        const [rows] = await pool.execute(query)
        return rows
    }

    static async getById(id) {
        const query = 'select id, activo from roles where id = ? limit 1'
        const [rows] = await pool.execute(query, [id])

        return rows[0]
    }

    static async newRol(name, desc, active) {
        const query = 'insert into roles (nombre, descripcion, activo) VALUES (?, ?, ?)'
        const [result] = await pool.execute(query, [name, desc, active])

        return result.insertId
    }

    static async getByName(name) {
        const query = 'select id, nombre from roles where nombre = ? limit 1'
        const [rows] = await pool.execute(query, [name])

        return rows[0]
    }

    static async updateRol(id, name, desc, active) {

        const query = `
        update roles 
        set nombre = ?, descripcion = ?, activo = ?
        where id = ?
        `
        return await pool.execute(query, [name, desc, active, id])

    }

    static async countUsersByRole(id) {
        const query = 'select count(*) as total from users where rol_id = ?'
        const [rows] = await pool.execute(query, [id])

        return rows[0].total
    }

    static async deleteRol(id) {
        const query = 'delete from roles where id = ?'
        const [result] = await pool.execute(query, [id])

        return result
    }

}
