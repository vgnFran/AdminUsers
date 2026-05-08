import { Router } from "express"
import { AuthController } from "../controllers/authController.js"
import { UsersController } from "../controllers/usersContoller.js"
import { auth } from "../middlewares/authMiddleware.js"

export const usersRouter = Router()

usersRouter.get("/check-session", auth, AuthController.checkSession)

usersRouter.post("/login",AuthController.login)
usersRouter.post("/logout", AuthController.logout)

usersRouter.get("/all", auth, UsersController.getAllUsers)
usersRouter.post("/new", auth, UsersController.newUser)
usersRouter.delete('/delete/:id', auth, UsersController.deleteUser)
usersRouter.get('/id/:id', auth, UsersController.getUserByID)
usersRouter.put('/update/:id', auth, UsersController.updateUser)
usersRouter.get('/stats', auth, UsersController.getStats)
usersRouter.get("/search", auth, UsersController.getUsersByFilter)