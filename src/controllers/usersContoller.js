import { UserModel } from '../models/usersModel.js'
import { RolesModel } from '../models/rolesModel.js'
import bcrypt from 'bcrypt'

export class UsersController{

    static async getAllUsers(req, res) {
        try {
            const users = await UserModel.getAllUsers()
            res.status(200).json(users)
        } catch (error) {
            res.status(500).json({ error: "Error al obtener usuarios" })
        }
    }

    static async getUserByID(req,res){

        const {id} = req.params

        if(!id){
            return res.status(404).json({ error: "ID de usuario incorrecto." })
        }

        try {
            const user = await UserModel.getById(id)
            if (!user){
                return res.status(404).json({ error: "Usuario no encontrado" })
            }

            res.status(200).json(user)    
        } catch (error) {
            res.status(500).json({ error: "Error al obtener usuarios" })
        }
    }

    static async getUsersByFilter(req, res) {

        const { filter } = req.query
        try {
            
            if (!filter || filter.trim() == "") {
                const allUsers = await UserModel.getAllUsers()
                return res.json(allUsers)
            }

            const results = await UserModel.getUserByFilter(filter)
            res.status(200).json(results)

        } catch (error) {
            console.error("Error en el buscador:", error)
            res.status(500).json({ error: "Error al realizar busqueda con filtro: " + error })
        }
    }

    static async newUser(req,res) {

        if (req.session.user.rol != "Admin") {
            return res.status(403).json({ error: "Usuario activo no posee permisos para esta accion." })
        }

        const { name, dni, email, rol, date, adress, cp, pass, confirmPass, obs, active } = req.body

        if(!name || !dni || !email || !rol || !pass) {
            return res.status(404).json({ error: "Debe completar todos los campos requeridos." })
        }

        if(pass.length < 8){
            return res.status(404).json({ error: "La contraseña debe tener al menos 8 caracteres." })
        }

        if (pass !== confirmPass) {
            return res.status(400).json({ error: "Las contraseñas no coinciden." })
        }

        try{

            const existUser = await UserModel.getUserByEmailOrDni(email, dni)
            if (existUser) {
                return res.status(409).json({ 
                    error: "El usuario ya se encuentra registrado." 
                })
            }

            const selectedRole = await RolesModel.getById(rol)

            if (!selectedRole) {
                return res.status(400).json({ error: "El rol seleccionado no existe." })
            }

            if (!selectedRole.activo) {
                return res.status(400).json({ error: "No se puede asignar un rol inactivo." })
            }


            const passwordHash = await bcrypt.hash(pass, 10)
            const userData = {
                name: name,
                email: email,
                passwordHash: passwordHash,
                dni: dni,
                date: date || null, 
                rol_id: rol,
                adress: adress || null,
                cp: cp || null,
                obs: obs || null,
                active: active ? 1 : 0 
            }

            const result = await UserModel.newUser(userData)
            res.status(201).json({ success: true, message: "Usuario creado correctamente" })

        } catch(error){
            console.error("Error al crear usuario en el controlador:", error)
            res.status(500).json({ error: "Error al crear usuario:" + error})
        }

    }


    static async deleteUser(req, res) {

        if (req.session.user.rol != "Admin") {
            return res.status(403).json({ error: "Usuario activo no posee permisos para esta accion." })
        }

        const { id } = req.params
        
        if (!id) {
            return res.status(400).json({ error: "Id de usuario no proporcionado" })
        }

        try {
            const result = await UserModel.deleteUser(id)

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Usuario inexistente" })
            }

            return res.status(200).json({ 
                success: true, 
                message: "Usuario eliminado correctamente" 
            })

        } catch (error) {
            console.error("Error al eliminar usuario:", error);
            return res.status(500).json({ error: "Error al eliminar usuario:" + error })
        }
    }


    static async updateUser(req, res) {

        if (req.session.user.rol != "Admin") {
            return res.status(403).json({ error: "Usuario activo no posee permisos para esta accion." })
        }

        const { id } = req.params;
        const { name, dni, email, rol, date, adress, cp, pass, confirmPass, obs, active } = req.body

        try {

            let passwordHash = null
            
            if (pass && pass.trim() !== "") {

                if (pass !== confirmPass) {
                    return res.status(400).json({ error: "Las contraseñas no coinciden." })
                }

                if (pass.length < 8) {
                    return res.status(400).json({ error: "La nueva contraseña debe tener al menos 8 caracteres." })
                }

                passwordHash = await bcrypt.hash(pass, 10)

            }

            const selectedRole = await RolesModel.getById(rol)

            if (!selectedRole) {
                return res.status(400).json({ error: "El rol seleccionado no existe." })
            }

            const currentUser = await UserModel.getById(id)

            if (!currentUser) {
                return res.status(404).json({ error: "Usuario no encontrado" })
            }

            if (!selectedRole.activo && Number(currentUser.rol_id) !== Number(rol)) {
                return res.status(400).json({ error: "No se puede asignar un rol inactivo." })
            }

            const userData = {
                nombre: name,
                dni: dni,
                email: email,
                passHash: passwordHash, 
                date: date || null,
                rol: rol,
                adress: adress,
                cp: cp,
                obs: obs,
                active: active ? 1 : 0
            }

            await UserModel.updateUser(id, userData)
            res.json({ success: true, message: "Usuario actualizado correctamente" })

        } catch (error) {
            console.error("Error en al actualizar usuario", error);
            res.status(500).json({ error: "Error al actualizar usuario" + error })
        }
    }

    static async getStats(req, res) {

        try {
            const stats = await UserModel.getStats()
            res.status(200).json(stats)
            
        } catch (error) {
            res.status(500).json({ error: "Error al obtener estadisticas" })
        }
    }


}
