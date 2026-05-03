import express from "express";
import cors from "cors";
import mysql from 'mysql2/promise'; 
import dotenv from 'dotenv'
import path from 'path';
import session from 'express-session';
import { fileURLToPath } from 'url';
import { usersRouter } from "./routes/users.js";

dotenv.config()
const app = express()
app.use(cors())
app.use(express.json())

app.use(session({
    secret: process.env.SESSION_SECRET, 
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, 
        httpOnly: true, 
        sameSite: 'strict',
        maxAge: 3600000,
    }
}))

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.setHeader('Access-Control-Allow-Credentials', true)
    next()
})

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT
app.listen(PORT, ()=>{
    console.log(`APP LISTEN IN PORT: ${PORT}`)
})

app.use("/users", usersRouter)