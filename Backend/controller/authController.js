import pool from "../database/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function register(req,res) {
    const { name,email,password,role } = req.body;
    if(!name || !email || !password || !role) {
        return res.status(400).json({ error : "All fields are required" });
    }
    if(!['student','admin'].includes(role)) {
        return res.status(400).json({ error : "Role must be a student or admin" });
    }
    try {
        const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if(existingUser.rows.length > 0) {
            return res.status(409).json({ error : "Email already registered" });
        }
        const passwordHash = await bcrypt.hash(password,10);
        const result = await pool.query(
            `INSERT INTO users (name,email,password_hash,role)
            VALUES ($1,$2,$3,$4) RETURNING id,name,email,role`,
            [name,email,passwordHash,role]
        );
        const user = result.rows[0];
        const token = jwt.sign({ userId : user.id,role : user.role}, process.env.JWT_SECRET,{ expiresIn : "7d" });
        res.status(200).json({ user,token });
    } catch(error) {
        console.error(error);
        res.status(500).json({ error : "Registration failed" });
    }
}

export async function login(req, res) {
    const { email,password } = req.body;
    if(!email || !password) {
        return res.status(400).json({ error : "Email and password are required" });
    }
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if(result.rows.length === 0) {
            return res.status(401).json({ error : "Invalid credentials" });
        }
        const user = result.rows[0];
        const match = await bcrypt.compare(password,user.password_hash);
        if(!match) {
            return res.status(401).json({ error : "Invalid credentials" });
        }
        const token = jwt.sign({ userId : user.id,role : user.role}, process.env.JWT_SECRET,{ expiresIn : "7d" });
        res.status(200).json({
            user : { id: user.id,name: user.name,email: user.email,role: user.role },
            token
        });
    } catch(error) {
        console.error(error);
        res.status(500).json({ error: "Login failed" });
    }
}