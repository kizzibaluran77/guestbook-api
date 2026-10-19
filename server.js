import express from 'express';
import pg from 'pg';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

// TODO 1: Setup Middleware (before the routes)
app.use(cors());
app.use(express.json());

// Database connection pool
const pool = new pg.Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});

// TODO 2: GET all messages
app.get('/api/messages', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM guestbook ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// TODO 3: POST a new message
app.post('/api/messages', async (req, res) => {
    try {
        const { name, message } = req.body;
        if (!name || !message) {
            return res.status(400).json({ error: 'Both "name" and "message" are required' });
        }
        const result = await pool.query(
            'INSERT INTO guestbook (name, message) VALUES ($1, $2) RETURNING *',
            [name, message]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save message' });
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});