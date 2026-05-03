import { UserModel } from '../models/usersModel.js';
import bcrypt from 'bcrypt';

export class AuthController{

    static async login(req, res) {

        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ error: "Todos los campos son obligatorios" })
        }

        try {
            const user = await UserModel.getUserByEmail(email)

            if(!user){
            return res.status(401).json({ error: "Credenciales incorrectas" })
            }

            const comparePass = await bcrypt.compare(password, user.password_hash)
            if(!comparePass){
                return res.status(401).json({ error: "Credenciales incorrectas" })
            }

            if (user.rol_nombre !== 'Admin') {
                return res.status(403).json({ error: "Acceso denegado: se requiere rol de administrador" })
            }

            if (!user.activo) {
                return res.status(403).json({ error: "Cuenta desactivada. Contacte al administrador." })
            }

            req.session.regenerate((err) => {
                if (err) throw err;

                req.session.user = {
                    id: user.id,
                    name: user.nombre,
                    rol: user.rol_nombre
                }

                res.json({ 
                    success: true, 
                    message: "Login exitoso",
                    user: { nombre: user.nombre, rol: user.rol_nombre }
                })

            })


        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error en el servidor" })
        }
    }

    static logout(req, res) {

        req.session.destroy((err) => {
            res.clearCookie('connect.sid'); 
            res.json({ success: true, message: "Sesion cerrada" })
        })
        
    }

    static checkSession(req,res){
        res.json({
            authenticated: true,
            user: req.session.user
        })
    }

}

