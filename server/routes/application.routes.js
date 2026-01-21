
import express from "express";
const router = express.Router();
import supabase from "../db/supabase.js";
import { authenticateToken, authorizeRole } from "../middleware/auth.middleware.js";

// POST /api/apply (Student)
router.post('/apply', authenticateToken, authorizeRole(['student']), async (req, res) => {
    const { profile_code } = req.body;
    const userid = req.user.userid;

    if (!profile_code) return res.status(400).json({ error: "Missing profile_code" });

    try {
        // 1. Check eligibility: "prevents applying if the student already has an Accepted offer in that session"
        // We need to check if this student has ANY application with status 'Accepted'.
        const { data: acceptedApps, error: eligibilityError } = await supabase
            .from('application')
            .select('*')
            .eq('entry_number', userid)
            .eq('status', 'Accepted');

        if (eligibilityError) throw eligibilityError;

        if (acceptedApps && acceptedApps.length > 0) {
            return res.status(400).json({ error: "You have already accepted an offer." });
        }

        // 2. Create application
        const { data, error } = await supabase
            .from('application')
            .insert([{ profile_code, entry_number: userid, status: 'Applied' }])
            .select();

        if (error) {
            // Check for duplicate application (PK constraint)
            if (error.code === '23505') {
                return res.status(400).json({ error: "Already applied to this profile." });
            }
            throw error;
        }

        res.json(data[0]);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/application/change_status (Recruiter/Admin)
router.post('/application/change_status', authenticateToken, authorizeRole(['admin', 'recruiter']), async (req, res) => {
    const { profile_code, entry_number, status } = req.body;

    // Recruiter validation: Can only change status for their own profiles.
    if (req.user.role === 'recruiter') {
        const { data: profile } = await supabase
            .from('profile')
            .select('recruiter_email')
            .eq('profile_code', profile_code)
            .single();

        if (!profile || profile.recruiter_email !== req.user.userid) {
            return res.status(403).json({ error: "You do not own this profile." });
        }
    }

    try {
        const { data, error } = await supabase
            .from('application')
            .update({ status })
            .eq('profile_code', profile_code)
            .eq('entry_number', entry_number)
            .select();

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/application/accept (Student)
router.post('/application/accept', authenticateToken, authorizeRole(['student']), async (req, res) => {
    const { profile_code } = req.body;
    // Wait, PDF says "student accepts a Selected application".
    // We should probably verify the current status is 'Selected'.

    const userid = req.user.userid;

    try {
        // 1. Verify it is currently 'Selected'
        const { data: app, error: fetchError } = await supabase
            .from('application')
            .select('*')
            .eq('profile_code', profile_code)
            .eq('entry_number', userid)
            .single();

        if (fetchError || !app) return res.status(404).json({ error: "Application not found" });
        if (app.status !== 'Selected') return res.status(400).json({ error: "Application is not in Selected status" });

        // 2. Update to 'Accepted'
        const { data, error } = await supabase
            .from('application')
            .update({ status: 'Accepted' })
            .eq('profile_code', profile_code)
            .eq('entry_number', userid)
            .select();

        if (error) throw error;
        res.json(data[0]);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/applications (For Recruiter/Admin view, and Student view)
router.get('/applications', authenticateToken, async (req, res) => {
    try {
        let query = supabase.from('application').select('*, profile(*), users(*)'); // Join profile and users info

        if (req.user.role === 'student') {
            query = query.eq('entry_number', req.user.userid);
        } else if (req.user.role === 'recruiter') {
            // Recruiters see applications for profiles they own.
            // This is complex in Supabase simple client without View/RPC if we filter by joined table.
            // "Recruiters can not see and thus change applications for profiles they do not own."
            // We might need to fetch profiles owned by recruiter first, then get apps.

            const { data: myProfiles } = await supabase
                .from('profile')
                .select('profile_code')
                .eq('recruiter_email', req.user.userid);

            const profileCodes = myProfiles.map(p => p.profile_code);
            query = query.in('profile_code', profileCodes);
        }

        const { data, error } = await query;
        if (error) throw error;
        res.json(data);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


export default router;
