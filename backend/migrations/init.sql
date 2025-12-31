-- ============================================================
-- CLEAN INITIAL SCHEMA
-- ============================================================

DO $$
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE format('DROP TABLE IF EXISTS public.%I CASCADE;', rec.tablename);
    END LOOP;

    FOR rec IN (SELECT sequencename FROM pg_sequences WHERE schemaname = 'public') LOOP
        EXECUTE format('DROP SEQUENCE IF EXISTS public.%I CASCADE;', rec.sequencename);
    END LOOP;

    FOR rec IN (SELECT typname FROM pg_type WHERE typtype = 'e' AND typnamespace = '2200') LOOP
        EXECUTE format('DROP TYPE IF EXISTS public.%I CASCADE;', rec.typname);
    END LOOP;
END $$;

-- ============================================================
-- ENUM DEFINITIONS
-- ============================================================

DO $$ BEGIN
    CREATE TYPE "ModeType" AS ENUM ('text', 'voice');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "TicketStatus" AS ENUM ('open', 'closed', 'in_progress');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "FlagStatus" AS ENUM ('pending', 'resolved');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "DifficultyLevelType" AS ENUM ('easy', 'medium', 'hard');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============================================================
-- CORE USER MANAGEMENT (Updated with Image/Screenshot fields)
-- ============================================================

CREATE TABLE IF NOT EXISTS "User" (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    
    -- updated Fields 
    profile_image TEXT,
    gender VARCHAR(50),
    university VARCHAR(255),
    graduation_year INT,
    phone_number VARCHAR(20),
    bio TEXT,
    experience_level VARCHAR(100),
    resume_path TEXT,

    -- Professional Info
    education TEXT,
    experience TEXT,
    preferred_role TEXT,
    preferred_roles TEXT[],
    preffered_languages TEXT[],
    skills TEXT[],
    programming_languages TEXT[],
    
    -- Location & Social
    location TEXT,
    address TEXT,
    hobbies TEXT,
    linkedin_profile TEXT,
    github_profile TEXT,
    portfolio TEXT,

    -- Account Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(), 
    is_admin BOOLEAN DEFAULT FALSE NOT NULL,
    is_blacklisted BOOLEAN DEFAULT FALSE NOT NULL
);

-- ============================================================
-- CLASSIFICATION TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS "Role" (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(100) NOT NULL,
    role_description TEXT
);

CREATE TABLE IF NOT EXISTS "Skill" (
    skill_id SERIAL PRIMARY KEY,
    skill_name VARCHAR(100) NOT NULL,
    skill_description TEXT
);

CREATE TABLE IF NOT EXISTS "ProgrammingLanguage" (
    lang_id SERIAL PRIMARY KEY,
    lang_name VARCHAR(100) NOT NULL,
    lang_description TEXT
);

CREATE TABLE IF NOT EXISTS "UserProfilePreference" (
    user_id INT UNIQUE REFERENCES "User"(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    role_id INT REFERENCES "Role"(role_id) ON DELETE SET NULL ON UPDATE CASCADE,
    skill_id INT REFERENCES "Skill"(skill_id) ON DELETE SET NULL ON UPDATE CASCADE,
    lang_id INT REFERENCES "ProgrammingLanguage"(lang_id) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Resume" (
    resume_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES "User"(user_id) ON DELETE CASCADE,
    file_path TEXT,
    parsed_skills TEXT[],
    parsed_experience TEXT[],
    parsed_education TEXT[],
    uploaded_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ============================================================
-- QUESTION MANAGEMENT
-- ============================================================

CREATE TABLE IF NOT EXISTS "EvaluationModel" (
    model_id SERIAL PRIMARY KEY,
    model_name VARCHAR(100) DEFAULT 'LLM-Model',
    description TEXT
);

CREATE TABLE IF NOT EXISTS "BaseQuestion" (
    question_id SERIAL PRIMARY KEY,
    is_predefined BOOLEAN DEFAULT TRUE NOT NULL,
    difficulty_level "DifficultyLevelType" DEFAULT 'easy',
    created_by INT REFERENCES "User"(user_id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    last_updated TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS "StaticQuestion" (
    static_question_id SERIAL PRIMARY KEY,
    base_question_id INT UNIQUE REFERENCES "BaseQuestion"(question_id) ON DELETE CASCADE,
    question_content TEXT NOT NULL,
    role_id INT REFERENCES "Role"(role_id) ON DELETE SET NULL,
    skill_id INT REFERENCES "Skill"(skill_id) ON DELETE SET NULL,
    lang_id INT REFERENCES "ProgrammingLanguage"(lang_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "DynamicQuestion" (
    dynamic_question_id SERIAL PRIMARY KEY,
    base_question_id INT UNIQUE REFERENCES "BaseQuestion"(question_id) ON DELETE CASCADE,
    model_id INT REFERENCES "EvaluationModel"(model_id) ON DELETE SET NULL,
    generated_question_content TEXT NOT NULL,
    resume_id INT REFERENCES "Resume"(resume_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "QuestionResponseMode" (
    question_response_mode_id SERIAL PRIMARY KEY,
    question_id INT UNIQUE REFERENCES "BaseQuestion"(question_id) ON DELETE CASCADE,
    mode "ModeType" NOT NULL
);

-- ============================================================
-- INTERVIEW SESSION TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS "Session" (
    session_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES "User"(user_id) ON DELETE CASCADE,
    interview_mode "ModeType",
    question_source VARCHAR(50),
    focus_area VARCHAR(255),
    prep_time_minutes INT,
    keywords TEXT[],
    start_time TIMESTAMP DEFAULT NOW() NOT NULL,
    end_time TIMESTAMP NULL,
    difficulty_level_start "DifficultyLevelType" DEFAULT 'easy',
    difficulty_level_end "DifficultyLevelType" DEFAULT 'easy',
    total_score FLOAT
);

CREATE TABLE IF NOT EXISTS "Answer" (
    answer_id SERIAL PRIMARY KEY,
    session_id INT REFERENCES "Session"(session_id) ON DELETE CASCADE,
    question_id INT REFERENCES "BaseQuestion"(question_id) ON DELETE CASCADE,
    mode_chosen "ModeType" NOT NULL,
    answer_text TEXT,
    answer_audio_path TEXT,
    start_time TIMESTAMP DEFAULT NOW() NOT NULL,
    end_time TIMESTAMP DEFAULT NOW() NOT NULL,
    score_content FLOAT,
    score_grammar FLOAT,
    score_clarity FLOAT,
    score_fluency FLOAT,
    score_overall FLOAT
);

CREATE TABLE IF NOT EXISTS "SessionHistory" (
    history_id SERIAL PRIMARY KEY,
    session_id INT REFERENCES "Session"(session_id) ON DELETE CASCADE,
    question_id INT REFERENCES "BaseQuestion"(question_id),
    answer_id INT REFERENCES "Answer"(answer_id),
    timestamp TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ============================================================
-- EVALUATION AND FEEDBACK
-- ============================================================

CREATE TABLE IF NOT EXISTS "Feedback" (
    feedback_id SERIAL PRIMARY KEY,
    answer_id INT UNIQUE REFERENCES "Answer"(answer_id) ON DELETE CASCADE,
    evaluation_model_id INT REFERENCES "EvaluationModel"(model_id) ON DELETE SET NULL,
    suggestion_text TEXT,
    generated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS "PerformanceReport" (
    report_id SERIAL PRIMARY KEY,
    session_id INT UNIQUE REFERENCES "Session"(session_id) ON DELETE CASCADE,
    generated_at TIMESTAMP DEFAULT NOW() NOT NULL,
    total_score FLOAT,
    avg_time_per_question FLOAT,
    strengths TEXT,
    weaknesses TEXT
);

-- ============================================================
-- ADDITIONAL FEATURES
-- ============================================================

CREATE TABLE IF NOT EXISTS "SupportTicket" (
    ticket_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES "User"(user_id) ON DELETE CASCADE,
    issue_type VARCHAR(100),
    message TEXT,
    status "TicketStatus" DEFAULT 'open',
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS "FlaggedContent" (
    flag_id SERIAL PRIMARY KEY,
    answer_id INT UNIQUE REFERENCES "Answer"(answer_id) ON DELETE CASCADE,
    model_id INT REFERENCES "EvaluationModel"(model_id),
    admin_id INT REFERENCES "User"(user_id) ON DELETE SET NULL,
    reason TEXT,
    status "FlagStatus" DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);