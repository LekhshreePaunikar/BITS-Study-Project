// backend/scripts/seed.js

/**
 * Seeds the "init.sql" schema with:
 * - 1 admin + 10 users
 * - 5 roles, 5 skills, 5 programming languages
 * - 1 UserProfilePreference per user (role+skill+lang)
 * - 1 Resume per user (NULL optional fields)
 * - Evaluation models: ChatGPT, Gemini
 * - 1 Support Ticket per user (admin included) with correct UserID
 *
 * PKs start from 1 each run via TRUNCATE ... RESTART IDENTITY CASCADE
 * 
 * Install deps (if not already) using command in the terminal: npm i bcryptjs pg
 * Run the script using:
 *   npm i pg dotenv bcryptjs   (if not installed yet)
 *   node "backend/scripts/seed.js"
 *
 * Uses DATABASE_URL from .env.local (try to keep the HOST, PORT, DB and URL same. use your own pgAdmin creds): 
 * --> POSTGRES_USER=postgres 
 * --> POSTGRES_PASSWORD=postgres 
 * --> POSTGRES_HOST=localhost 
 * --> POSTGRES_PORT=5432 
 * --> POSTGRES_DB=BITS_Project 
 * --> DATABASE_URL=postgresql://postgres:postgres@localhost:5432/BITS_Project
 */

const { Pool } = require('pg');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

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

    // ---- Clean slate: TRUNCATE all related tables and reset identity to 1
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

    // --- 1) Users
    const plainPassword = '123456';
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    // Admin: only the specified fields; others remain NULL; created_at auto
    const adminRes = await db.query(
      `INSERT INTO "User"
        ("name","email","password_hash","isAdmin","isBlacklisted")
       VALUES
        ($1,$2,$3,$4,$5)
       RETURNING "userID","name"`,
      ['admin', 'admin@example.com', passwordHash, true, false]
    );
    const admin = adminRes.rows[0];

    // 10 normal users
    const users = [];
    for (let i = 1; i <= 10; i++) {
      const r = await db.query(
        `INSERT INTO "User"
          ("name","email","password_hash","education","experience",
           "preferred_roles","preferred_languages","isAdmin","isBlacklisted")
         VALUES
          ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         RETURNING "userID","name"`,
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

    // --- 2) Roles
    const rolesSeed = [
      ['Frontend', 'Client-side engineering'],
      ['Backend', 'Server-side engineering'],
      ['Fullstack', 'End-to-end application development'],
      ['DevOps', 'Deployment/Infra/CI/CD'],
      ['Data Engineer', 'Pipelines and data systems'],
    ];
    const roles = [];
    for (const [roleName, roleDescription] of rolesSeed) {
      const r = await db.query(
        `INSERT INTO "Role" ("roleName","roleDescription")
         VALUES ($1,$2)
         RETURNING "roleID","roleName"`,
        [roleName, roleDescription]
      );
      roles.push(r.rows[0]);
    }
    log(`Inserted roles: ${roles.length}`);

    // --- 3) Skills
    const skillsSeed = [
      ['DSA', 'Data Structures & Algorithms'],
      ['AWS', 'Amazon Web Services'],
      ['AI-ML', 'Artificial Intelligence & Machine Learning'],
      ['System Design', 'High-level architecture and design'],
      ['Database', 'SQL/NoSQL design & optimization'],
    ];
    const skills = [];
    for (const [skillName, skillDescription] of skillsSeed) {
      const r = await db.query(
        `INSERT INTO "Skill" ("skillName","skillDescription")
         VALUES ($1,$2)
         RETURNING "skillID","skillName"`,
        [skillName, skillDescription]
      );
      skills.push(r.rows[0]);
    }
    log(`Inserted skills: ${skills.length}`);

    // --- 4) Programming Languages
    const langsSeed = [
      ['Python', 'General-purpose scripting language'],
      ['C++', 'High-performance compiled language'],
      ['Java', 'JVM-based language for enterprise apps'],
      ['JavaScript', 'Web language (Node/Browser)'],
      ['Go', 'Systems & cloud services language'],
    ];
    const langs = [];
    for (const [langName, langDescription] of langsSeed) {
      const r = await db.query(
        `INSERT INTO "ProgrammingLanguage" ("langName","langDescription")
         VALUES ($1,$2)
         RETURNING "langID","langName"`,
        [langName, langDescription]
      );
      langs.push(r.rows[0]);
    }
    log(`Inserted programming languages: ${langs.length}`);

    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

    // --- 5) UserProfilePreference (1 per user, include admin)
    for (const u of [admin, ...users]) {
      const role = pick(roles);
      const skill = pick(skills);
      const lang = pick(langs);
      await db.query(
        `INSERT INTO "UserProfilePreference" ("userID","roleID","skillID","langID")
         VALUES ($1,$2,$3,$4)
         ON CONFLICT ("userID") DO UPDATE
            SET "roleID" = EXCLUDED."roleID",
                "skillID" = EXCLUDED."skillID",
                "langID" = EXCLUDED."langID"`,
        [u.userID, role.roleID, skill.skillID, lang.langID]
      );
    }
    log(`Inserted/updated user profile preferences: ${users.length + 1}`);

    // --- 6) Resume (1 per user)
    for (const u of [admin, ...users]) {
      await db.query(
        `INSERT INTO "Resume" ("userID","filePath","parsedSkills","parsedExperience","parsedEducation")
         VALUES ($1, NULL, NULL, NULL, NULL)`,
        [u.userID]
      );
    }
    log(`Inserted resumes: ${users.length + 1}`);

    // --- 7) Evaluation models
    await db.query(
      `INSERT INTO "EvaluationModel" ("modelName","description") VALUES ($1,$2)`,
      ['ChatGPT', 'OpenAI ChatGPT model']
    );
    await db.query(
      `INSERT INTO "EvaluationModel" ("modelName","description") VALUES ($1,$2)`,
      ['Gemini', 'Google Gemini model']
    );
    log('Inserted evaluation models: ChatGPT, Gemini');

    // --- 8) Support tickets: exactly 1 per user (admin included)
    const issueTypes = ['Login', 'Billing', 'Bug', 'Feature Request', 'Other'];
    for (const u of [admin, ...users]) {
      const it = pick(issueTypes);
      await db.query(
        `INSERT INTO "SupportTicket" ("UserID","IssueType","Message","Status","CreatedAt","UpdatedAt")
         VALUES ($1,$2,$3,'open', NOW(), NOW())`,
        [u.userID, it, `Dummy ${it} ticket from ${u.name}`]
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
