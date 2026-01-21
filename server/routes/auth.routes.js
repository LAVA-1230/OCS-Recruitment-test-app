import express from "express";
const router = express.Router();
import supabase from "../db/supabase.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET, authenticateToken } from "../middleware/auth.middleware.js";

// POST /api/login
router.post('/login', async (req, res) => {
    const { userid, password_md5 } = req.body;

    if (!userid || !password_md5) {
        return res.status(400).json({ error: 'Missing userid or password_md5' });
    }

    try {
        // Check user in Supabase
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('userid', userid)
            .single();

        if (error || !user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Compare hashes (PDF requirement 2 & 3)
        if (user.password_hash !== password_md5) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Valid: Generate Token
        const token = jwt.sign(
            { userid: user.userid, role: user.role },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token, role: user.role });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/users/me
router.get('/users/me', authenticateToken, async (req, res) => {
    // Return the user info strictly from the DB to be safe, or just echo the token info.
    // PDF says "return logged-in user record"
    const { data: user, error } = await supabase
        .from('users')
        .select('userid, role') // Don't return hash
        .eq('userid', req.user.userid)
        .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json(user);
});

export default router;  