import { Router } from "express"
import { RolesController }  from "../controllers/rolesController.js"
import { auth } from "../middlewares/authMiddleware.js"

export const rolesRouter = Router()

rolesRouter.get('/all', auth, RolesController.getAllRoles)
rolesRouter.post('/new', auth, RolesController.newRol)
rolesRouter.put('/update/:id', auth, RolesController.updateRol)
rolesRouter.delete('/delete/:id', auth, RolesController.deleteRol)
