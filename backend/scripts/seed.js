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

const { Pool } = require('pg');
const path = require('path');
const bcrypt = require('bcryptjs');
require("dotenv").config({ path: path.resolve(__dirname, "../../.env.local") });
console.log("Using DATABASE_URL:", process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

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
        "FlaggedContent",
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
        "Resume",
        "UserProfilePreference",
        "ProgrammingLanguage",
        "Skill",
        "Role",
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
        (name, email, password_hash, is_admin, is_blacklisted)
      VALUES
        ($1, $2, $3, $4, $5)
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
          (name, email, password_hash, education, experience,
           preferred_roles, preferred_languages, is_admin, is_blacklisted)
        VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING user_id, name
        `,
        [
          `user${i}`,
          `user${i}@example.com`,
          passwordHash,
          'B.Tech Computer Science',
          '1–3 years in backend development',
          ['Software Developer', 'Backend Developer'],
          ['JavaScript', 'Python', 'SQL'],
          false,
          false,
        ]
      );
      users.push(r.rows[0]);
    }
    log(`Inserted users: ${1 + users.length}`);

    // Roles
    const rolesSeed = [
      ['Frontend', 'Client-side engineering'],
      ['Backend', 'Server-side engineering'],
      ['Fullstack', 'End-to-end application development'],
      ['DevOps', 'Deployment/Infra/CI/CD'],
      ['Data Engineer', 'Pipelines and data systems'],
    ];
    const roles = [];
    for (const [role_name, role_description] of rolesSeed) {
      const r = await db.query(
        `
        INSERT INTO "Role" (role_name, role_description)
        VALUES ($1, $2)
        RETURNING role_id, role_name
        `,
        [role_name, role_description]
      );
      roles.push(r.rows[0]);
    }
    log(`Inserted roles: ${roles.length}`);

    // Skills
    const skillsSeed = [
      ['DSA', 'Data Structures & Algorithms'],
      ['AWS', 'Amazon Web Services'],
      ['AI-ML', 'Artificial Intelligence & Machine Learning'],
      ['System Design', 'High-level architecture and design'],
      ['Database', 'SQL/NoSQL design & optimization'],
    ];
    const skills = [];
    for (const [skill_name, skill_description] of skillsSeed) {
      const r = await db.query(
        `
        INSERT INTO "Skill" (skill_name, skill_description)
        VALUES ($1, $2)
        RETURNING skill_id, skill_name
        `,
        [skill_name, skill_description]
      );
      skills.push(r.rows[0]);
    }
    log(`Inserted skills: ${skills.length}`);

    // Programming languages
    const langsSeed = [
      ['Python', 'General-purpose scripting language'],
      ['C++', 'High-performance compiled language'],
      ['Java', 'JVM-based language for enterprise apps'],
      ['JavaScript', 'Web language (Node/Browser)'],
      ['Go', 'Systems & cloud services language'],
    ];
    const langs = [];
    for (const [lang_name, lang_description] of langsSeed) {
      const r = await db.query(
        `
        INSERT INTO "ProgrammingLanguage" (lang_name, lang_description)
        VALUES ($1, $2)
        RETURNING lang_id, lang_name
        `,
        [lang_name, lang_description]
      );
      langs.push(r.rows[0]);
    }
    log(`Inserted programming languages: ${langs.length}`);

    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

    // UserProfilePreference (1 per user, include admin)
    for (const u of [admin, ...users]) {
      const role = pick(roles);
      const skill = pick(skills);
      const lang = pick(langs);
      await db.query(
        `
        INSERT INTO "UserProfilePreference" (user_id, role_id, skill_id, lang_id)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id) DO UPDATE
          SET role_id = EXCLUDED.role_id,
              skill_id = EXCLUDED.skill_id,
              lang_id = EXCLUDED.lang_id
        `,
        [u.user_id, role.role_id, skill.skill_id, lang.lang_id]
      );
    }
    log(`Inserted/updated user profile preferences: ${users.length + 1}`);

    // Resume (1 per user)
    for (const u of [admin, ...users]) {
      await db.query(
        `
        INSERT INTO "Resume" (user_id, file_path, parsed_skills, parsed_experience, parsed_education)
        VALUES ($1, NULL, NULL, NULL, NULL)
        `,
        [u.user_id]
      );
    }
    log(`Inserted resumes: ${users.length + 1}`);

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
        [u.user_id, it, `Dummy ${it} ticket from ${u.name}`]
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
