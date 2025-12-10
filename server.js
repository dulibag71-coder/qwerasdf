const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const fs = require('fs');

// --- Configuration ---
const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = "130824"; // System Admin Password

// Database Connection
// Use DATABASE_URL env var or default to local (though PG usually needs a server)
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/golf_club_v11';
const pool = new Pool({
    connectionString,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false // For Heroku/Fly/Render which might use SSL
});

// --- Middleware ---
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- Schema Initialization ---
const initSchema = async () => {
    try {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Users
            await client.query(`CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT UNIQUE,
                password TEXT,
                nickname TEXT,
                profile_img TEXT,
                personal_credits INTEGER DEFAULT 0,
                role TEXT DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`);

            // Clubs
            await client.query(`CREATE TABLE IF NOT EXISTS clubs (
                id TEXT PRIMARY KEY,
                name TEXT,
                owner_id TEXT,
                invite_code TEXT UNIQUE,
                credits INTEGER DEFAULT 0,
                xp INTEGER DEFAULT 0,
                level INTEGER DEFAULT 1,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`);

            // Club Members
            await client.query(`CREATE TABLE IF NOT EXISTS club_members (
                id TEXT PRIMARY KEY,
                club_id TEXT,
                user_id TEXT,
                role TEXT DEFAULT 'member',
                joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(club_id, user_id)
            )`);

            // Club Posts
            await client.query(`CREATE TABLE IF NOT EXISTS club_posts (
                id TEXT PRIMARY KEY,
                club_id TEXT,
                user_id TEXT,
                content TEXT,
                type TEXT DEFAULT 'normal',
                likes INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`);

            // Club Comments
            await client.query(`CREATE TABLE IF NOT EXISTS club_comments (
                id TEXT PRIMARY KEY,
                post_id TEXT,
                user_id TEXT,
                content TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`);

            // Credit History
            await client.query(`CREATE TABLE IF NOT EXISTS club_credit_history (
                id TEXT PRIMARY KEY,
                club_id TEXT,
                user_id TEXT,
                action TEXT,
                amount INTEGER,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`);

            // Payments
            await client.query(`CREATE TABLE IF NOT EXISTS payments (
                id TEXT PRIMARY KEY,
                club_id TEXT,
                requester_id TEXT,
                amount INTEGER,
                credit_amount INTEGER,
                plan_type TEXT,
                status TEXT DEFAULT 'pending',
                admin_confirmed_by TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`);

            // Swing Records
            await client.query(`CREATE TABLE IF NOT EXISTS swing_records (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                club_id TEXT,
                video_path TEXT,
                analysis_json TEXT,
                score_tempo INTEGER,
                score_balance INTEGER,
                score_rotation INTEGER,
                overall_score INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`);

            await client.query('COMMIT');
            console.log("✅ PostgreSQL Schema Initialized");
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error("❌ Schema Init Error:", err);
    }
};

initSchema();

// --- Helper Functions ---
function generateId() { return uuidv4(); }
function generateInviteCode() { return Math.random().toString(36).substring(2, 8).toUpperCase(); }

// --- Routes ---

// 1. Auth & User
app.post('/api/register', async (req, res) => {
    const { username, password, nickname } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const id = generateId();

    try {
        await pool.query(
            `INSERT INTO users (id, username, password, nickname) VALUES ($1, $2, $3, $4)`,
            [id, username, hashedPassword, nickname]
        );
        res.json({ id, username, nickname, role: 'user' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query(`SELECT * FROM users WHERE username = $1`, [username]);
        const user = result.rows[0];

        if (!user) return res.status(401).json({ error: 'User not found' });
        if (bcrypt.compareSync(password, user.password)) {
            res.json(user);
        } else {
            res.status(401).json({ error: 'Invalid password' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admin-login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        res.json({ token: 'ADMIN_TOKEN_130824', role: 'admin' });
    } else {
        res.status(401).json({ error: 'Wrong Admin Password' });
    }
});

// 2. Club Management
app.post('/api/clubs/create', async (req, res) => {
    const { userId, name, description } = req.body;
    const clubId = generateId();
    const inviteCode = generateInviteCode();

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Create Club
        await client.query(
            `INSERT INTO clubs (id, name, owner_id, invite_code, description) VALUES ($1, $2, $3, $4, $5)`,
            [clubId, name, userId, inviteCode, description]
        );

        // Add Owner as Member
        const memberId = generateId();
        await client.query(
            `INSERT INTO club_members (id, club_id, user_id, role) VALUES ($1, $2, $3, 'owner')`,
            [memberId, clubId, userId]
        );

        await client.query('COMMIT');
        res.json({ clubId, start: true });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

app.post('/api/clubs/join', async (req, res) => {
    const { userId, inviteCode } = req.body;
    try {
        const result = await pool.query(`SELECT id FROM clubs WHERE invite_code = $1`, [inviteCode]);
        const club = result.rows[0];

        if (!club) return res.status(404).json({ error: 'Invalid Code' });

        const memberId = generateId();
        await pool.query(
            `INSERT INTO club_members (id, club_id, user_id, role) VALUES ($1, $2, $3, 'member')`,
            [memberId, club.id, userId]
        );
        res.json({ success: true, clubId: club.id });
    } catch (err) {
        res.status(400).json({ error: 'Already joined or error' });
    }
});

app.get('/api/users/:userId/clubs', async (req, res) => {
    const { userId } = req.params;
    const sql = `
        SELECT c.*, cm.role 
        FROM clubs c 
        JOIN club_members cm ON c.id = cm.club_id 
        WHERE cm.user_id = $1
    `;
    try {
        const result = await pool.query(sql, [userId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/clubs/:clubId/members', async (req, res) => {
    const { clubId } = req.params;
    const sql = `
        SELECT u.id, u.nickname, u.profile_img, cm.role, cm.joined_at
        FROM club_members cm
        JOIN users u ON cm.user_id = u.id
        WHERE cm.club_id = $1
        ORDER BY cm.role DESC
    `;
    try {
        const result = await pool.query(sql, [clubId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Wallet & Payments
app.get('/api/clubs/:clubId/credits', async (req, res) => {
    const { clubId } = req.params;
    try {
        const result = await pool.query(`SELECT credits FROM clubs WHERE id = $1`, [clubId]);
        res.json({ credits: result.rows[0] ? result.rows[0].credits : 0 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/clubs/payment-request', async (req, res) => {
    const { clubId, userId, planType } = req.body;
    let amount = 0, credits = 0;
    if (planType === 'month') { amount = 23000; credits = 30000; }
    else if (planType === 'year') { amount = 280000; credits = 420000; }
    else return res.status(400).json({ error: "Invalid plan" });

    const id = generateId();
    try {
        await pool.query(
            `INSERT INTO payments (id, club_id, requester_id, amount, credit_amount, plan_type) VALUES ($1, $2, $3, $4, $5, $6)`,
            [id, clubId, userId, amount, credits, planType]
        );
        res.json({ success: true, paymentId: id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/admin/payments', async (req, res) => {
    const sql = `
        SELECT p.*, c.name as club_name, u.nickname as requester_name 
        FROM payments p
        JOIN clubs c ON p.club_id = c.id
        JOIN users u ON p.requester_id = u.id
        WHERE p.status = 'pending'
        ORDER BY p.created_at DESC
    `;
    try {
        const result = await pool.query(sql);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admin/payments/confirm', async (req, res) => {
    const { paymentId, adminId } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const pres = await client.query(`SELECT * FROM payments WHERE id = $1`, [paymentId]);
        const payment = pres.rows[0];

        if (!payment || payment.status !== 'pending') throw new Error("Invalid payment");

        // Execute Updates
        await client.query(`UPDATE payments SET status = 'approved', admin_confirmed_by = $1 WHERE id = $2`, [adminId, paymentId]);
        await client.query(`UPDATE clubs SET credits = credits + $1 WHERE id = $2`, [payment.credit_amount, payment.club_id]);

        const histId = generateId();
        await client.query(
            `INSERT INTO club_credit_history (id, club_id, user_id, action, amount, description) VALUES ($1, $2, $3, 'charge', $4, $5)`,
            [histId, payment.club_id, payment.requester_id, payment.credit_amount, `Payment Approved: ${payment.plan_type}`]
        );

        await client.query('COMMIT');
        res.json({ success: true });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// 4. Board
app.post('/api/clubs/:clubId/posts', async (req, res) => {
    const { clubId, userId, content, type } = req.body;
    const id = generateId();
    try {
        await pool.query(
            `INSERT INTO club_posts (id, club_id, user_id, content, type, likes) VALUES ($1, $2, $3, $4, $5, 0)`,
            [id, clubId, userId, content, type]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/posts/:postId/like', async (req, res) => {
    const { postId } = req.params;
    try {
        await pool.query(`UPDATE club_posts SET likes = likes + 1 WHERE id = $1`, [postId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/clubs/:clubId/posts', async (req, res) => {
    const { clubId } = req.params;
    const sql = `
        SELECT p.*, u.nickname, u.profile_img 
        FROM club_posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.club_id = $1
        ORDER BY p.created_at DESC
    `;
    try {
        const result = await pool.query(sql, [clubId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Analysis
const isVercel = process.env.VERCEL === '1';
const uploadDir = isVercel ? '/tmp' : 'uploads/';
const upload = multer({ dest: uploadDir });
app.post('/api/analyze', upload.single('video'), async (req, res) => {
    const { userId, clubId } = req.body;
    const COST = 10;

    // Simulate Logic: Just save. In real world we check credits transactionally.
    if (clubId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const clubRes = await client.query(`SELECT credits, xp, level FROM clubs WHERE id = $1`, [clubId]);
            const club = clubRes.rows[0];

            if (!club || club.credits < COST) throw new Error("Not enough credits");

            // Deduct & Award XP
            await client.query(`UPDATE clubs SET credits = credits - $1, xp = xp + 50 WHERE id = $2`, [COST, clubId]);

            // Level Up Check
            if ((club.xp + 50) >= club.level * 1000) {
                await client.query(`UPDATE clubs SET level = level + 1 WHERE id = $1`, [clubId]);
            }

            await client.query(
                `INSERT INTO club_credit_history (id, club_id, user_id, action, amount, description) VALUES ($1, $2, $3, 'use', $4, 'Swing Analysis')`,
                [generateId(), clubId, userId, COST]
            );

            // Average for comp
            const avgRes = await client.query(`SELECT AVG(overall_score) as avgScore FROM swing_records WHERE club_id = $1`, [clubId]);
            const clubAvg = avgRes.rows[0].avgscore ? Math.round(avgRes.rows[0].avgscore) : 75; // Note: pg returns lowercase keys usually or strict

            const analysisResult = simulateAIAnalysis(clubAvg);

            // Save Record
            const recId = generateId();
            await client.query(
                `INSERT INTO swing_records (id, user_id, club_id, video_path, analysis_json, score_tempo, score_balance, score_rotation, overall_score) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [recId, userId, clubId, req.file ? req.file.path : 'demo.mp4', JSON.stringify(analysisResult), analysisResult.tempo, analysisResult.balance, analysisResult.rotation, analysisResult.score]
            );

            await client.query('COMMIT');
            res.json(analysisResult);

        } catch (err) {
            await client.query('ROLLBACK');
            res.status(500).json({ error: err.message });
        } finally {
            client.release();
        }
    } else {
        res.json(simulateAIAnalysis(70));
    }
});

function simulateAIAnalysis(clubAvg) {
    const tempo = Math.floor(Math.random() * 20) + 80;
    const balance = Math.floor(Math.random() * 30) + 70;
    const rotation = Math.floor(Math.random() * 40) + 60;
    const score = Math.floor((tempo + balance + rotation) / 3);

    let tier = 'ROOKIE';
    if (score >= 90) tier = 'TOUR PRO';
    else if (score >= 85) tier = 'PRO';
    else if (score >= 80) tier = 'SEMI PRO';
    else if (score >= 70) tier = 'AMATEUR';

    const drills = [
        { title: "Tempo Master Drill", url: "https://youtube.com/shorts/sample1", tag: "Tempo" },
        { title: "Hip Rotation Fix", url: "https://youtube.com/shorts/sample2", tag: "Rotation" }
    ];

    return {
        tempo, balance, rotation, score,
        tier,
        clubAvg,
        feedback: "백스윙 톱에서 클럽 헤드가 약간 처지는 경향이 있습니다.",
        drills,
        comparison: score - clubAvg
    };
}

// 6. Reports
app.get('/api/clubs/:clubId/report', async (req, res) => {
    const { clubId } = req.params;
    try {
        const r1 = await pool.query(`SELECT COUNT(*) as count FROM swing_records WHERE club_id = $1`, [clubId]);
        const r2 = await pool.query(`SELECT SUM(amount) as used FROM club_credit_history WHERE club_id = $1 AND action = 'use'`, [clubId]);
        const r3 = await pool.query(`SELECT u.nickname, MAX(sr.overall_score) as best_score FROM swing_records sr JOIN users u ON sr.user_id = u.id WHERE sr.club_id = $1 GROUP BY sr.user_id, u.nickname ORDER BY best_score DESC LIMIT 3`, [clubId]); // PG requires grouping by nickname too

        res.json({
            totalAnalysis: r1.rows[0].count,
            creditsUsed: r2.rows[0].used || 0,
            leaders: r3.rows
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Server Start ---
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
    });
}

module.exports = app;
