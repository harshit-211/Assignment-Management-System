import pool from "../database/db.js";

export async function getSummary(req, res) {
  const adminId = req.user.userId;
  try {
    const assignmentsResult = await pool.query(
      'SELECT id, title FROM assignments WHERE created_by = $1',
      [adminId]
    );
    const assignments = assignmentsResult.rows;

    const perAssignment = [];
    for (const a of assignments) {
      const statusResult = await pool.query(
        `SELECT
           COUNT(*) FILTER (WHERE status = 'confirmed') AS confirmed,
           COUNT(*) AS total
         FROM groups g
         LEFT JOIN submissions s ON s.group_id = g.id AND s.assignment_id = $1`,
        [a.id]
      );
      perAssignment.push({
        assignment_id: a.id,
        title: a.title,
        confirmed: Number(statusResult.rows[0].confirmed),
        total_groups: Number(statusResult.rows[0].total),
      });
    }

    const totalAssignments = assignments.length;
    const totalConfirmations = perAssignment.reduce((sum, a) => sum + a.confirmed, 0);
    const totalPossible = perAssignment.reduce((sum, a) => sum + a.total_groups, 0);
    const completionRate =
      totalPossible > 0 ? Math.round((totalConfirmations / totalPossible) * 100) : 0;

    res.json({
      total_assignments: totalAssignments,
      completion_rate_percent: completionRate,
      per_assignment: perAssignment,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
}