const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
// Middleware to check if user is admin
const checkAdmin = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const result = await query('SELECT is_admin FROM "User" WHERE user_id = $1', [userId]);
    
    if (!result.rows.length || !result.rows[0].is_admin) {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
    
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ error: 'Server error during authorization' });
  }
};
// Get analytics data
router.get('/data', checkAdmin, async (req, res) => {
  try {
    const { timeRange = '30d', roleFilter = 'all', categoryFilter = 'all' } = req.query;
    
    // Calculate date range
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    
    // 1. Daily Active Users (last 20 days)
    const dailyActiveUsersQuery = `
      SELECT 
        TO_CHAR(DATE(start_time), 'DD Mon') as date,
        COUNT(DISTINCT user_id) as users
      FROM "Session"
      WHERE start_time >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(start_time)
      ORDER BY DATE(start_time) ASC
      LIMIT 20
    `;
    const dailyActiveUsers = await query(dailyActiveUsersQuery);

    // 2. Monthly Active Users (last 6 months)
    const monthlyActiveUsersQuery = `
      SELECT 
        TO_CHAR(start_time, 'Mon') as month,
        COUNT(DISTINCT user_id) as users
      FROM "Session"
      WHERE start_time >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR(start_time, 'Mon'), DATE_TRUNC('month', start_time)
      ORDER BY DATE_TRUNC('month', start_time) ASC
    `;
    const monthlyActiveUsers = await query(monthlyActiveUsersQuery);

    // 3. Role Distribution
let roleDistributionQuery = `
  SELECT 
    TRIM(role) as name,
    COUNT(*) as value
  FROM "User",
  LATERAL UNNEST(STRING_TO_ARRAY(preferred_roles, ',')) AS role
  WHERE preferred_roles IS NOT NULL AND preferred_roles != ''
  ${roleFilter !== 'all' ? `AND preferred_roles ILIKE '%${roleFilter}%'` : ''}
  GROUP BY TRIM(role)
  ORDER BY value DESC
  LIMIT 5
`;
    const roleDistribution = await query(roleDistributionQuery);

    // 4. Top Questions (most answered)
    let topQuestionsQuery = `
      SELECT 
        sq.question_content as question,
        COUNT(CASE WHEN a.answer_text IS NOT NULL AND a.answer_text != '' THEN 1 END) as answered,
        COUNT(CASE WHEN a.answer_text IS NULL OR a.answer_text = '' THEN 1 END) as skipped
      FROM "Answer" a
      JOIN "BaseQuestion" bq ON a.question_id = bq.question_id
      JOIN "StaticQuestion" sq ON bq.question_id = sq.base_question_id
      WHERE a.start_time >= NOW() - INTERVAL '${days} days'
      GROUP BY sq.static_question_id, sq.question_content
      ORDER BY answered DESC
      LIMIT 10
    `;
    const topQuestions = await query(topQuestionsQuery);

    // 5. Engagement Data (completion funnel)
    const engagementQueries = {
      started: `SELECT COUNT(DISTINCT session_id) as count FROM "Session" WHERE start_time >= NOW() - INTERVAL '${days} days'`,
      answeredQ1: `SELECT COUNT(DISTINCT a.session_id) as count FROM "Answer" a WHERE a.start_time >= NOW() - INTERVAL '${days} days'`,
      answeredQ3: `
        SELECT COUNT(DISTINCT session_id) as count 
        FROM (
          SELECT session_id, COUNT(*) as answer_count 
          FROM "Answer" 
          WHERE start_time >= NOW() - INTERVAL '${days} days'
          GROUP BY session_id 
          HAVING COUNT(*) >= 3
        ) subq
      `,
      completed: `SELECT COUNT(DISTINCT session_id) as count FROM "Session" WHERE end_time IS NOT NULL AND start_time >= NOW() - INTERVAL '${days} days'`
    };

    const [started, answeredQ1, answeredQ3, completed] = await Promise.all([
      query(engagementQueries.started),
      query(engagementQueries.answeredQ1),
      query(engagementQueries.answeredQ3),
      query(engagementQueries.completed)
    ]);

    const engagementData = [
      { stage: 'Started', users: parseInt(started.rows[0]?.count || 0) },
      { stage: 'Answered Q1', users: parseInt(answeredQ1.rows[0]?.count || 0) },
      { stage: 'Answered Q3', users: parseInt(answeredQ3.rows[0]?.count || 0) },
      { stage: 'Completed', users: parseInt(completed.rows[0]?.count || 0) }
    ];

    // 6. Login Activity Heatmap (last 35 days)
    const heatmapQuery = `
      SELECT 
        DATE(start_time) as date,
        COUNT(DISTINCT user_id) as logins
      FROM "Session"
      WHERE start_time >= NOW() - INTERVAL '35 days'
      GROUP BY DATE(start_time)
      ORDER BY DATE(start_time) DESC
      LIMIT 35
    `;
    const heatmapData = await query(heatmapQuery);

    res.json({
      dailyActiveUsers: dailyActiveUsers.rows.map(row => ({
        date: row.date,
        users: parseInt(row.users)
      })),
      monthlyActiveUsers: monthlyActiveUsers.rows.map(row => ({
        month: row.month,
        users: parseInt(row.users)
      })),
      roleDistribution: roleDistribution.rows.map(row => ({
        name: row.name.trim(),
        value: parseInt(row.value)
      })),
      topQuestions: topQuestions.rows.map(row => ({
        question: row.question.substring(0, 50) + (row.question.length > 50 ? '...' : ''),
        answered: parseInt(row.answered),
        skipped: parseInt(row.skipped)
      })),
      engagementData,
      heatmapData: heatmapData.rows.map(row => ({
        date: row.date,
        logins: parseInt(row.logins)
      }))
    });

  } catch (error) {
    console.error('Analytics data fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch analytics data',
      details: error.message 
    });
  }
});

module.exports = router;