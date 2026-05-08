import { RolesModel } from '../models/rolesModel.js'

export class RolesController{

    static async getAllRoles(req, res) {

        try {
            const roles = await RolesModel.getAllRoles()
            res.status(200).json(roles)

        } catch (error) {
            console.error("Error en getRoles: ", error)
            res.status(500).json({ error: "Error al obtener lista de roles" })
        }
    }

    static async newRol(req, res) {

        try {
            const { name, desc, active } = req.body

            if (!name){
              return res.status(400).json({ error: "El nombre es obligatorio" })  
            } 

            const existRole = await RolesModel.getByName(name)

            if (existRole) {
                return res.status(409).json({ error: "Ya existe un rol con ese nombre" })
            }

            await RolesModel.newRol(name, desc, active ? 1 : 0)

            res.status(201).json({ message: "Rol creado con éxito" })

        } catch (error) {
            console.log(error)
            res.status(500).json({ error: "Error al crear el rol " + error })
        }
    }

    static async updateRol(req, res) {

        try {

            const { id } = req.params
            const { name, desc, active } = req.body

            if (!name) return res.status(400).json({ error: "El nombre es obligatorio" })

            const existRole = await RolesModel.getByName(name)

            if (existRole && existRole.id != id) {
                return res.status(409).json({ error: "Ya existe un rol con ese nombre" })
            }

            await RolesModel.updateRol(id, name, desc, active ? 1 : 0)

            res.status(200).json({ message: "Rol actualizado con exito" })

        } catch (error) {
            console.error(error)
            res.status(500).json({ error: "Error al actualizar el rol " + error })
        }
    }

    static async deleteRol(req, res) {

        try {

            const { id } = req.params

            if (!id) return res.status(400).json({ error: "Id de rol incorrecto" })

            const usersCount = await RolesModel.countUsersByRole(id)

            if (usersCount > 0) {
                return res.status(409).json({ error: "No se puede eliminar un rol con usuarios asignados" })
            }

            const result = await RolesModel.deleteRol(id)

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Rol inexistente" })
            }

            res.status(200).json({ success: true, message: "Rol eliminado correctamente" })

        } catch (error) {
            console.error(error)
            res.status(500).json({ error: "Error al eliminar el rol " + error })
        }
    }



}
