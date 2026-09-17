import pool from "../database/db.js";

async function userInGroup(userId, groupId) {
  const result = await pool.query(
    'SELECT 1 FROM group_members WHERE user_id = $1 AND group_id = $2',
    [userId, groupId]
  );
  return result.rows.length > 0;
}

export async function confirmStep1(req, res) {
  const { assignmentId } = req.params;
  const { group_id } = req.body;
  const userId = req.user.userId;

  if (!group_id) return res.status(400).json({ error: 'group_id is required' });

  const belongs = await userInGroup(userId, group_id);
  if (!belongs) return res.status(403).json({ error: 'You are not a member of this group' });

  try {
    const existing = await pool.query(
      'SELECT * FROM submissions WHERE assignment_id = $1 AND group_id = $2',
      [assignmentId, group_id]
    );
    if (existing.rows.length === 0) {
      const result = await pool.query(
        `INSERT INTO submissions (assignment_id, group_id, status)
         VALUES ($1, $2, 'pending') RETURNING *`,
        [assignmentId, group_id]
      );
      return res.status(201).json({ ...result.rows[0], message: 'Confirm again to finalize' });
    }
    res.json({ ...existing.rows[0], message: 'Confirm again to finalize' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to start confirmation' });
  }
}

export async function confirmStep2(req, res) {
  const { assignmentId } = req.params;
  const { group_id } = req.body;
  const userId = req.user.userId;

  if (!group_id) return res.status(400).json({ error: 'group_id is required' });

  const belongs = await userInGroup(userId, group_id);
  if (!belongs) return res.status(403).json({ error: 'You are not a member of this group' });

  try {
    const result = await pool.query(
      `UPDATE submissions
       SET status = 'confirmed', confirmed_by = $1, confirmed_at = NOW()
       WHERE assignment_id = $2 AND group_id = $3
       RETURNING *`,
      [userId, assignmentId, group_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Call the confirm step first' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to confirm submission' });
  }
}

export async function getSubmissionsForAssignment(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT g.id AS group_id, g.name AS group_name,
              COALESCE(s.status, 'not_started') AS status,
              s.confirmed_at
       FROM groups g
       LEFT JOIN submissions s ON s.group_id = g.id AND s.assignment_id = $1
       ORDER BY g.name`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
}

export async function getSubmissionsForGroup(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT a.id AS assignment_id, a.title, a.due_date, a.onedrive_link,
              COALESCE(s.status, 'not_started') AS status
       FROM assignments a
       LEFT JOIN submissions s ON s.assignment_id = a.id AND s.group_id = $1
       LEFT JOIN assignment_groups ag ON ag.assignment_id = a.id AND ag.group_id = $1
       WHERE a.target_type = 'all' OR ag.group_id = $1
       ORDER BY a.due_date`,
      [id]
    );
    const total = result.rows.length;
    const confirmed = result.rows.filter((r) => r.status === 'confirmed').length;
    res.json({ assignments: result.rows, progress: { total, confirmed } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch group progress' });
  }
}