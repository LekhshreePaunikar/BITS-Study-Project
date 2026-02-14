// backend/scripts/seed.js

/**
 * Seeds the schema with:
 * - 1 admin + 10 users
 * - 5 roles, 5 skills, 5 programming languages
 * - 1 UserProfilePreference per user (role+skill+lang)
 * - 1 Resume per user (NULL optional fields)
 * - Evaluation models: ChatGPT, Gemini
 * - 1 SupportTicket per user (admin included)
 *
 * Requires env:
 *   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/BITS_Project
 */

const { pool } = require('../config/database');
const path = require('path');
const bcrypt = require('bcryptjs');

const log = (...a) => console.log('[seed]', ...a);

async function withTx(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const res = await fn(client);
    await client.query('COMMIT');
    return res;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

async function seed() {
  await withTx(async (db) => {
    log('Connected. Seeding…');

    // Clean slate
    await db.query(`
      TRUNCATE TABLE
        "SupportTicket",
        "PerformanceReport",
        "Feedback",
        "SessionHistory",
        "Answer",
        "Session",
        "QuestionResponseMode",
        "DynamicQuestion",
        "StaticQuestion",
        "BaseQuestion",
        "EvaluationModel",
        "User"
      RESTART IDENTITY CASCADE;
    `);

    // Users
    const plainPassword = '123456';
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    // Admin
    const adminRes = await db.query(
      `
      INSERT INTO "User"
        (name, email, password_hash,
 preferred_roles, skills, programming_languages,
         is_admin, is_blacklisted)
      VALUES
        ($1, $2, $3, NULL, NULL, NULL, $4, $5)
      
      RETURNING user_id, name
      `,
      ['admin', 'admin@example.com', passwordHash, true, false]
    );
    const admin = adminRes.rows[0];

    // 10 normal users
    const users = [];
    for (let i = 1; i <= 10; i++) {
      const r = await db.query(

        `
        INSERT INTO "User"
          (
            name,
            email,
            password_hash,
            education,
            experience,
            preferred_roles,
            skills,
            programming_languages,
            phone_number,
            location,
            hobbies,
            linkedin_profile,
            github_profile,
            portfolio,
            is_admin,
            is_blacklisted
          )
        VALUES
         (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
  )
RETURNING user_id, name;

  `,
        [
          `user${i}`,
          `user${i}@example.com`,
          passwordHash,
          'B.Tech Computer Science',
          '1–3 years in backend development',

          'Backend Developer',                       // preferred_role
          ['UI/UX Design', 'Data Analytics'],        // skills
          ['JavaScript', 'Python', 'SQL'],           // programming_languages

          '+91 999000111',                            // phone
          'India',                                    // location
          'Reading, Coding',                          // hobbies
          `https://linkedin.com/in/user${i}`,         // linkedin_profile
          `https://github.com/user${i}`,              // github_profile
          `https://user${i}.portfolio.com`,           // portfolio

          false,
          false
        ]
      );
      users.push(r.rows[0]);
    }
    log(`Inserted users: ${1 + users.length}`);


    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

    // -------------------------------------------------------
    // BASE QUESTIONS + STATIC QUESTIONS (PREDEFINED)
    // -------------------------------------------------------
    log("Inserting BaseQuestion + StaticQuestion...");

    // Insert BaseQuestions
    const baseQuestions = await db.query(`
      INSERT INTO "BaseQuestion" (is_predefined, difficulty, created_by)
      VALUES
        (true, 'easy', 1),
        (true, 'easy', 1),
        (true, 'medium', 1),
        (true, 'easy', 1),
        (true, 'medium', 1),
        (true, 'easy', 1),
        (true, 'easy', 1),
        (true, 'easy', 1),
        (true, 'easy', 1),
        (true, 'easy', 1),
        (true, 'easy', 1),
        (true, 'easy', 1),
        (true, 'medium', 1)
      RETURNING question_id;
    `);

    const baseIds = baseQuestions.rows.map(r => r.question_id);

    // Insert StaticQuestions (1–1 mapping)
    await db.query(`
      INSERT INTO "StaticQuestion"
        (base_question_id, question_content, roles, skills, langs)
      VALUES
        ($1, 'Dummy Question-1 for testing', ARRAY['Backend Developer', 'Frontend Developer'], ARRAY['API Development', 'UI/UX Design', 'Leadership'], ARRAY['JavaScript']),
        ($2, 'Dummy Question-2 for testing', ARRAY['Backend Developer', 'Frontend Developer'], ARRAY['API Development', 'UI/UX Design', 'Leadership'], ARRAY['JavaScript']),
        ($3, 'Dummy Question-3 for testing', ARRAY['Backend Developer', 'Frontend Developer'], ARRAY['API Development', 'UI/UX Design', 'Leadership'], ARRAY['JavaScript']),
        ($4, 'Dummy Question-4 for testing', ARRAY['Backend Developer', 'Frontend Developer'], ARRAY['API Development', 'UI/UX Design', 'Leadership'], ARRAY['JavaScript']),
        ($5, 'Dummy Question-5 for testing', ARRAY['Backend Developer', 'Frontend Developer'], ARRAY['API Development', 'UI/UX Design', 'Leadership'], ARRAY['JavaScript']),
        ($6, 'Dummy Question-6 for testing', ARRAY['Backend Developer', 'Frontend Developer'], ARRAY['API Development', 'UI/UX Design', 'Leadership'], ARRAY['JavaScript']),
        ($7, 'Dummy Question-7 for testing', ARRAY['Backend Developer', 'Frontend Developer'], ARRAY['API Development', 'UI/UX Design', 'Leadership'], ARRAY['JavaScript']),
        ($8, 'Dummy Question-8 for testing', ARRAY['Backend Developer', 'Frontend Developer'], ARRAY['API Development', 'UI/UX Design', 'Leadership'], ARRAY['JavaScript']),
        ($9, 'Dummy Question-9 for testing', ARRAY['Backend Developer', 'Frontend Developer'], ARRAY['API Development', 'UI/UX Design', 'Leadership'], ARRAY['JavaScript']),
        ($10, 'Dummy Question-10 for testing', ARRAY['Backend Developer'], ARRAY['API Development'], ARRAY['JavaScript']),
        ($11, 'Dummy Question-11 for testing', ARRAY['Backend Developer'], ARRAY['API Development'], ARRAY['JavaScript']),
        ($12, 'Dummy Question-12 for testing', ARRAY['Backend Developer'], ARRAY['API Development'], ARRAY['JavaScript']),
        ($13, 'Dummy Question-13 for testing', ARRAY['Backend Developer'], ARRAY['API Development'], ARRAY['JavaScript'])
    `, baseIds);

    log("Inserted predefined questions (Base + Static)");



    // -------------------------------------------------------
    // INSERT 5 DUMMY SESSIONS FOR user1 → user5
    // -------------------------------------------------------
    log("Creating 5 dummy sessions for first 5 users...");

    // Pick the first 5 users (user1, user2, user3, user4, user5)
    const topFiveUsers = users.slice(0, 5);

    for (const u of topFiveUsers) {
      await db.query(
        `
    INSERT INTO "Session"
      (user_id,
        interview_mode,
        question_source,
        focus_area,
        prep_time_minutes,
        keywords,
        start_time,
        end_time,
        selected_difficulty,
        total_score
      )
    VALUES
      (
        $1,
        'text',
        'predefined',
        'System Design',
        2,
        ARRAY['APIs', 'React'],
        NOW(),
        NOW() + INTERVAL '30 minutes',
        'easy',
        80
      )
    `
        , [u.user_id]
      );
    }

    log("Inserted dummy sessions for top 5 users.");

    // -------------------------------------------------------
    // ADD EXTRA COMPLETED SESSIONS FOR user_id = 2
    // -------------------------------------------------------
    log("Creating 3 completed sessions for user_id = 2...");

    const completedSessionsForUser2 = [
      { minutesAgo: 180, score: 50 }, // 3 hours ago
      { minutesAgo: 120, score: 60 }, // 2 hours ago
      { minutesAgo: 60, score: 70 }, // 1 hour ago
    ];

    for (const s of completedSessionsForUser2) {
      await db.query(
        `
    INSERT INTO "Session"
      (
        user_id,
        interview_mode,
        question_source,
        focus_area,
        prep_time_minutes,
        keywords,
        start_time,
        end_time,
        selected_difficulty,
        total_score
      )
    VALUES
      (
        $1,
        'voice',
        'resume-based',
        'Backend Development',
        2,
        ARRAY['Node.js', 'Databases'],
        NOW() - ($2 || ' minutes')::INTERVAL,
        NOW() - ($2 || ' minutes')::INTERVAL + INTERVAL '30 minutes',
        'medium',
        $3
      )
    `,
        [2, s.minutesAgo, s.score]
      );
    }

    log("Inserted 3 completed sessions for user_id = 2.");

    // Evaluation models
    await db.query(
      `INSERT INTO "EvaluationModel" (model_name, description) VALUES ($1, $2)`,
      ['ChatGPT', 'OpenAI ChatGPT model']
    );
    await db.query(
      `INSERT INTO "EvaluationModel" (model_name, description) VALUES ($1, $2)`,
      ['Gemini', 'Google Gemini model']
    );
    log('Inserted evaluation models: ChatGPT, Gemini');

    // Support tickets: 1 per user (admin included)
    const issueTypes = ['Login', 'Billing', 'Bug', 'Feature Request', 'Other'];
    for (const u of [admin, ...users]) {
      const it = pick(issueTypes);
      await db.query(
        `
        INSERT INTO "SupportTicket" (user_id, issue_type, message, status, created_at, updated_at)
        VALUES ($1, $2, $3, 'open', NOW(), NOW())
        `,
        [u.user_id, it, `Dummy ${it} ticket|| Ticket description from ${u.name} for the testing purposes`]
      );
    }
    log(`Inserted support tickets: ${1 + users.length}`);

    log('SEEDING SUCCESSFULLY COMPLETED.');
  });
}



seed()
  .catch((err) => {
    console.error('SEEDING FAILED:', err);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
