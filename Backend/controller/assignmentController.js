import pool from "../database/db.js";

export async function createAssignment(req, res) {
  const { title, description, due_date, onedrive_link, target_type, group_ids } = req.body;
  const createdBy = req.user.userId;

  if (!title || !due_date || !onedrive_link || !target_type) {
    return res
      .status(400)
      .json({ error: 'title, due_date, onedrive_link and target_type are required' });
  }
  if (!['all', 'group'].includes(target_type)) {
    return res.status(400).json({ error: 'target_type must be "all" or "group"' });
  }
  if (target_type === 'group' && (!group_ids || group_ids.length === 0)) {
    return res.status(400).json({ error: 'group_ids is required when target_type is "group"' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      `INSERT INTO assignments (title, description, due_date, onedrive_link, target_type, created_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, description || null, due_date, onedrive_link, target_type, createdBy]
    );
    const assignment = result.rows[0];

    if (target_type === 'group') {
      for (const groupId of group_ids) {
        await client.query(
          'INSERT INTO assignment_groups (assignment_id, group_id) VALUES ($1, $2)',
          [assignment.id, groupId]
        );
      }
    }
    await client.query('COMMIT');
    res.status(201).json(assignment);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to create assignment' });
  } finally {
    client.release();
  }
}

export async function updateAssignment(req, res) {
  const { id } = req.params;
  const { title, description, due_date, onedrive_link } = req.body;
  try {
    const result = await pool.query(
      `UPDATE assignments
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           due_date = COALESCE($3, due_date),
           onedrive_link = COALESCE($4, onedrive_link)
       WHERE id = $5 RETURNING *`,
      [title, description, due_date, onedrive_link, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update assignment' });
  }
}

export async function getAssignments(req, res) {
  const { userId, role } = req.user;
  try {
    if (role === 'admin') {
      const result = await pool.query(
        'SELECT * FROM assignments WHERE created_by = $1 ORDER BY due_date',
        [userId]
      );
      return res.json(result.rows);
    }

    const result = await pool.query(
      `SELECT DISTINCT a.* FROM assignments a
       LEFT JOIN assignment_groups ag ON ag.assignment_id = a.id
       LEFT JOIN group_members gm ON gm.group_id = ag.group_id
       WHERE a.target_type = 'all'
          OR (a.target_type = 'group' AND gm.user_id = $1)
       ORDER BY a.due_date`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
}