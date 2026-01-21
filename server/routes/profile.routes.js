import express from "express";
const router = express.Router();
import supabase from "../db/supabase.js";
import { authenticateToken, authorizeRole } from "../middleware/auth.middleware.js";

// GET /api/profiles
// List profiles.
// Student: See all profiles? Or filter? PDF: "show a list of all available profiles".
// "if the student has any application with status = 'Selected', then... do not show the profiles list"
// We'll handle that logic here or in frontend. Let's send all for now, but backend *could* check.
// Optimization: Check eligibility here.
router.get('/profiles', authenticateToken, async (req, res) => {
    try {
        // If student has accepted an offer, they shouldn't see generic profiles?
        // But PDF says: "immediately after login the UI must prominently show the selected profile(s) — do not show the profiles list"
        // This implies frontend logic, but backend should ideally enforce.

        // Simplest implementation: Return all profiles.
        let query = supabase.from('profile').select('*');

        // If recruiter, PDF says "create and manage profiles... associated with their recruiter_email"
        // Does GET /profiles list ALL or just theirs? Admin sees all. Recruiter sees theirs?
        // PDF implies Recruiter -> "Profiles management: allow... to create and manage profiles... associated with their recruiter_email"
        // It doesn't explicitly say they can't see others, but implies ownership.
        // Let's filter for recruiters to own profiles, and students/admin see all (or students see all).

        if (req.user.role === 'recruiter') {
            const { data: userEmail } = await supabase.from('users').select('userid').eq('userid', req.user.userid).single();
            // Wait, users table describes userid (string). Is userid the email for recruiter?
            // PDF Data: userid="recruiter1@techcorp.com"
            // Profile table: recruiter_email matches userid.
            query = query.eq('recruiter_email', req.user.userid);
        }

        const { data, error } = await query;
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/create_profile (Recruiter or Admin)
router.post('/create_profile', authenticateToken, authorizeRole(['admin', 'recruiter']), async (req, res) => {
    const { company_name, designation } = req.body;
    // recruiter_email should be the logged in user if recruiter, or provided if admin?
    // For simplicity, if recruiter, force their email.

    let recruiter_email = req.body.recruiter_email;
    if (req.user.role === 'recruiter') {
        recruiter_email = req.user.userid;
    }

    if (!recruiter_email || !company_name) {
        return res.status(400).json({ error: "Missing fields" });
    }

    const { data, error } = await supabase
        .from('profile')
        .insert([{ recruiter_email, company_name, designation }])
        .select();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]);
});

export default router;
