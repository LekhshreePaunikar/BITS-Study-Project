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
        (name, email, password_hash,
         address, preferred_role, skills, programming_languages,
         is_admin, is_blacklisted)
      VALUES
        ($1, $2, $3, NULL, NULL, NULL, NULL, $4, $5)
      
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
            address,
            preferred_role,
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
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
  )
RETURNING user_id, name;

  `,
        [
          `user${i}`,
          `user${i}@example.com`,
          passwordHash,
          'B.Tech Computer Science',
          '1–3 years in backend development',

          ['Software Developer', 'Backend Developer'],
         

          'Delhi, India',                           // address
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

    // Roles
    // Roles - full match with frontend
    const rolesSeed = [
      ['Frontend Developer', 'Client-side engineering'],
      ['Backend Developer', 'Server-side engineering'],
      ['Full Stack Developer', 'Both frontend and backend'],
      ['Cloud Engineer', 'Cloud infrastructure and services'],
      ['DevOps Engineer', 'CI/CD, automation, infrastructure'],
      ['Data Scientist', 'Data modeling and analytics'],
      ['Machine Learning Engineer', 'ML systems and pipelines'],
      ['Mobile Developer', 'Android/iOS app development'],
      ['UI/UX Designer', 'Design and user experience'],
      ['Product Manager', 'Product strategy and planning'],
      ['Software Architect', 'High-level system design'],
      ['Quality Assurance Engineer', 'Testing and QA']
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
    // Skills - full match with frontend
    const skillsSeed = [
      ['UI/UX Design', 'Designing user experiences and interfaces'],
      ['Data Analytics', 'Analyzing and interpreting complex data'],
      ['Data Structures & Algorithms', 'Core problem-solving skills'],
      ['Problem Solving', 'Logical and analytical thinking'],
      ['System Design', 'High-level architecture and systems'],
      ['Database Management', 'SQL/NoSQL database design'],
      ['API Development', 'Building REST/GraphQL APIs'],
      ['Cloud Computing', 'Cloud services and architectures'],
      ['Machine Learning', 'ML models and pipelines'],
      ['Project Management', 'Planning and executing projects'],
      ['Version Control (Git)', 'Git workflows and tools'],
      ['Testing & QA', 'Software testing and quality assurance'],
      ['Agile Methodologies', 'Scrum, Kanban, agile frameworks'],
      ['Communication Skills', 'Effective team communication'],
      ['Leadership', 'Team leadership and decision-making']
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
    // Programming languages - full match with frontend
    const langsSeed = [
      ['JavaScript', 'Web and backend language'],
      ['Python', 'General-purpose scripting'],
      ['Java', 'Enterprise backend development'],
      ['C++', 'High-performance systems'],
      ['C#', '.NET architecture development'],
      ['TypeScript', 'Typed JavaScript'],
      ['Go', 'Cloud and systems language'],
      ['Rust', 'Memory-safe high-performance language'],
      ['Swift', 'iOS/macOS development'],
      ['Kotlin', 'Android development'],
      ['PHP', 'Backend scripting language'],
      ['Ruby', 'Ruby on Rails ecosystem'],
      ['SQL', 'Database querying language'],
      ['HTML/CSS', 'Frontend markup and styling'],
      ['React', 'UI component framework'],
      ['Node.js', 'JavaScript backend runtime'],
      ['Angular', 'Frontend framework'],
      ['Vue.js', 'Progressive UI framework']
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

        // -------------------------------------------------------
    // BASE QUESTIONS + STATIC QUESTIONS (PREDEFINED)
    // -------------------------------------------------------
    log("Inserting BaseQuestion + StaticQuestion...");

    // Insert BaseQuestions
    const baseQuestions = await db.query(`
      INSERT INTO "BaseQuestion" (is_predefined, difficulty)
      VALUES
        (true, 'easy'),
        (true, 'easy'),
        (true, 'medium'),
        (true, 'easy'),
        (true, 'medium'),
        (true, 'easy'),
        (true, 'easy'),
        (true, 'easy'),
        (true, 'easy'),
        (true, 'easy'),
        (true, 'easy'),
        (true, 'easy'),
        (true, 'medium')
      RETURNING question_id;
    `);

    const baseIds = baseQuestions.rows.map(r => r.question_id);

    // Insert StaticQuestions (1–1 mapping)
    await db.query(`
      INSERT INTO "StaticQuestion"
        (base_question_id, question_content, role_id, skill_id, lang_id)
      VALUES
        ($1, 'Dummy Question-1 for testing', NULL, NULL, NULL),
        ($2, 'Dummy Question-2 for testing', NULL, NULL, NULL),
        ($3, 'Dummy Question-3 for testing', NULL, NULL, NULL),
        ($4, 'Dummy Question-4 for testing', NULL, NULL, NULL),
        ($5, 'Dummy Question-5 for testing', NULL, NULL, NULL),
        ($6, 'Dummy Question-6 for testing', NULL, NULL, NULL),
        ($7, 'Dummy Question-7 for testing', NULL, NULL, NULL),
        ($8, 'Dummy Question-8 for testing', NULL, NULL, NULL),
        ($9, 'Dummy Question-9 for testing', NULL, NULL, NULL),
        ($10, 'Dummy Question-10 for testing', NULL, NULL, NULL),
        ($11, 'Dummy Question-11 for testing', NULL, NULL, NULL),
        ($12, 'Dummy Question-12 for testing', NULL, NULL, NULL),
        ($13, 'Dummy Question-113 for testing', NULL, NULL, NULL)
    `, baseIds);

    log("Inserted predefined questions (Base + Static)");


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
        NOW(),
        'easy',
        NULL
      )
    `
        , [u.user_id]
      );
    }

    log("Inserted dummy sessions for top 5 users.");

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
