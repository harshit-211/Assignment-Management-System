import pool from "../database/db.js";

export async function createGroup(req, res) {
    const { name } = req.body;
    const userId = req.user.userId;
    if(!name) {
        return res.status(400).json({ error : "Group name is required" });
    }
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const groupResult = await client.query(
            'INSERT INTO groups (name,created_by) VALUES ($1,$2) RETURNING *',
            [name,userId]
        );
        const group = groupResult.rows[0];
        await client.query(
            'INSERT INTO group_members (group_id,user_id) VALUES ($1,$2)',
            [group.id,userId]
        );
        await client.query('COMMIT');
        res.status(200).json(group);
    } catch(error) {
        await client.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ error: "Failed to create group" });
    } finally {
        client.release();
    }
}

export async function addMember(req, res) {
    const groupId = req.params.id;
    const { email } = req.body;
    if(!email) {
        return res.status(400).json({ error: "Email is required" });
    }
    try {
        const userResult = await pool.query(
            'SELECT id FROM users WHERE email = $1 AND role = $2',
            [email,'student']
        );
        if(userResult.rows.length === 0) {
            return res.status(404).json({ error: "No student found with that email" });
        }
        const memberId = userResult.rows[0].id;
        const existing = await pool.query(
            'SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2',
            [groupId,memberId]
        );
        if(existing.rows.length > 0) {
            return res.status(409).json({ error: "User is already a member of this group" });
        }
        await pool.query(
            'INSERT INTO group_members (group_id,user_id) VALUES ($1,$2)',
            [groupId,memberId]
        );
        res.status(200).json({ message : "Member added" });
    } catch(error) {
        console.error(error);
        res.status(500).json({ error : "Failed to add member" });
    }
}

export async function getMyGroups(req, res) {
    const userId = req.user.userId;
    try {
        const result = await pool.query(
            `SELECT g.* FROM groups g
            JOIN group_members gm ON gm.group_id = g.id
            WHERE gm.user_id = $1
            ORDER BY created_at DESC`,
            [userId]
        );
        res.status(200).json(result.rows);
    } catch(error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch groups" });
    }
}

export async function getGroupById(req, res) {
    const groupId = req.params.id;
    try {
        const groupResult = await pool.query('SELECT * FROM groups WHERE id = $1', [groupId]);
        if(groupResult.rows.length === 0) {
            return res.status(404).json({ error: "No groups found" });
        }
        const membersResult = await pool.query(
            `SELECT u.id,u.name,u.email FROM users u
            JOIN group_members gm ON gm.user_id = u.id
            WHERE gm.group_id = $1`,
            [groupId]
        );
        res.status(200).json({ ...groupResult.rows[0], members : membersResult.rows });
    } catch(error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch group" });
    }
}