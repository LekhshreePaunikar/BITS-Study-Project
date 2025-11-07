-- root/backend/migrations/init.sql

-- ==============================
-- WARNING: This wipes the entire schema. 
-- Safe for development only.
-- ==============================
DO $$ DECLARE
    rec RECORD;
BEGIN
    -- Drop all tables in the public schema
    FOR rec IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE format('DROP TABLE IF EXISTS public.%I CASCADE;', rec.tablename);
    END LOOP;

    -- Drop all sequences
    FOR rec IN (SELECT sequencename FROM pg_sequences WHERE schemaname = 'public') LOOP
        EXECUTE format('DROP SEQUENCE IF EXISTS public.%I CASCADE;', rec.sequencename);
    END LOOP;

    -- Drop all enum types
    FOR rec IN (SELECT typname FROM pg_type WHERE typtype = 'e' AND typnamespace = '2200') LOOP
        EXECUTE format('DROP TYPE IF EXISTS public.%I CASCADE;', rec.typname);
    END LOOP;
END $$;

-- ==============================+
-- ENUM DEFINITIONS
-- ==============================+
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

-- ==============================
-- CORE USER MANAGEMENT TABLES
-- ==============================

CREATE TABLE IF NOT EXISTS "User" (
  "userID" SERIAL PRIMARY KEY,
  "name" VARCHAR(100) NOT NULL,
  "email" VARCHAR(120) UNIQUE NOT NULL,
  "password_hash" TEXT NOT NULL,
  "education" TEXT,
  "experience" TEXT,
  "preferred_roles" TEXT[],
  "preferred_languages" TEXT[],
  "created_at" TIMESTAMP DEFAULT NOW(),
  "isAdmin" BOOLEAN DEFAULT FALSE NOT NULL,
  "isBlacklisted" BOOLEAN DEFAULT FALSE NOT NULL
);

-- ==============================
-- CLASSIFICATION TABLES
-- ==============================

CREATE TABLE IF NOT EXISTS "Role" (
    "roleID" SERIAL PRIMARY KEY,
    "roleName" VARCHAR(100) NOT NULL,
    "roleDescription" TEXT
);

CREATE TABLE IF NOT EXISTS "Skill" (
    "skillID" SERIAL PRIMARY KEY,
    "skillName" VARCHAR(100) NOT NULL,
    "skillDescription" TEXT
);

CREATE TABLE IF NOT EXISTS "ProgrammingLanguage" (
    "langID" SERIAL PRIMARY KEY,
    "langName" VARCHAR(100) NOT NULL,
    "langDescription" TEXT
);

CREATE TABLE IF NOT EXISTS "UserProfilePreference" (
    "userID" INT UNIQUE REFERENCES "User"("userID") ON DELETE CASCADE ON UPDATE CASCADE,
    "roleID" INT REFERENCES "Role"("roleID") ON DELETE SET NULL ON UPDATE CASCADE,
    "skillID" INT REFERENCES "Skill"("skillID") ON DELETE SET NULL ON UPDATE CASCADE,
    "langID" INT REFERENCES "ProgrammingLanguage"("langID") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Resume" (
    "resumeID" SERIAL PRIMARY KEY,
    "userID" INT REFERENCES "User"("userID") ON DELETE CASCADE,
    "filePath" TEXT,
    "parsedSkills" TEXT[],
    "parsedExperience" TEXT[],
    "parsedEducation" TEXT[],
    "uploadedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ==============================
-- QUESTION MANAGEMENT TABLES
-- ==============================

CREATE TABLE IF NOT EXISTS "EvaluationModel" (
    "modelID" SERIAL PRIMARY KEY,
    "modelName" VARCHAR(100) DEFAULT 'LLM-Model',
    "description" TEXT
);

-- BaseQuestion = Core question anchor
CREATE TABLE IF NOT EXISTS "BaseQuestion" (
    "questionID" SERIAL PRIMARY KEY,
    "isPredefined" BOOLEAN DEFAULT TRUE NOT NULL,
    "difficultyLevel" "DifficultyLevelType" DEFAULT 'easy',
    "createdBy" INT REFERENCES "User"("userID") ON DELETE SET NULL,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "lastUpdated" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- StaticQuestion = Predefined question content (for IsPredefined = TRUE)
CREATE TABLE IF NOT EXISTS "StaticQuestion" (
    "staticQuestionID" SERIAL PRIMARY KEY,
    "baseQuestionID" INT UNIQUE REFERENCES "BaseQuestion"("questionID") ON DELETE CASCADE,
    "questionContent" TEXT NOT NULL,
    "roleID" INT REFERENCES "Role"("roleID") ON DELETE SET NULL,
    "skillID" INT REFERENCES "Skill"("skillID") ON DELETE SET NULL,
    "langID" INT REFERENCES "ProgrammingLanguage"("langID") ON DELETE SET NULL
);

-- DynamicQuestion = AI-generated question content (for IsPredefined = FALSE)
CREATE TABLE IF NOT EXISTS "DynamicQuestion" (
    "dynamicQuestionID" SERIAL PRIMARY KEY,
    "baseQuestionID" INT UNIQUE REFERENCES "BaseQuestion"("questionID") ON DELETE CASCADE,
    "modelID" INT REFERENCES "EvaluationModel"("modelID") ON DELETE SET NULL,
    "generatedQuestionContent" TEXT NOT NULL,
    "resumeID" INT REFERENCES "Resume"("resumeID") ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "QuestionResponseMode" (
    "questionResponseModeID" SERIAL PRIMARY KEY,
    "questionID" INT UNIQUE REFERENCES "BaseQuestion"("questionID") ON DELETE CASCADE,
    "mode" "ModeType" NOT NULL
);

-- ==============================
-- INTERVIEW SESSION TABLES
-- ==============================

CREATE TABLE IF NOT EXISTS "Session" (
    "sessionID" SERIAL PRIMARY KEY,
    "userID" INT REFERENCES "User"("userID") ON DELETE CASCADE,
    "startTime" TIMESTAMP DEFAULT NOW() NOT NULL,
    "endTime" TIMESTAMP DEFAULT NOW() NOT NULL,
    "difficultyLevelStart" "DifficultyLevelType" DEFAULT 'easy',
    "difficultyLevelEnd" "DifficultyLevelType" DEFAULT 'easy',
    "totalScore" FLOAT
);

CREATE TABLE IF NOT EXISTS "Answer" (
    "answerID" SERIAL PRIMARY KEY,
    "sessionID" INT REFERENCES "Session"("sessionID") ON DELETE CASCADE,
    "questionID" INT REFERENCES "BaseQuestion"("questionID") ON DELETE CASCADE,
    "modeChosen" "ModeType" NOT NULL,
    "answerText" TEXT,
    "answerAudioPath" TEXT,
    "startTime" TIMESTAMP DEFAULT NOW() NOT NULL,
    "endTime" TIMESTAMP DEFAULT NOW() NOT NULL,
    "scoreContent" FLOAT,
    "scoreGrammar" FLOAT,
    "scoreClarity" FLOAT,
    "scoreFluency" FLOAT,
    "scoreOverall" FLOAT
);

CREATE TABLE IF NOT EXISTS "SessionHistory" (
    "historyID" SERIAL PRIMARY KEY,
    "sessionID" INT REFERENCES "Session"("sessionID") ON DELETE CASCADE,
    "questionID" INT REFERENCES "BaseQuestion"("questionID"),
    "answerID" INT REFERENCES "Answer"("answerID"),
    "timestamp" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ==============================
-- EVALUATION AND FEEDBACK TABLES
-- ==============================

CREATE TABLE IF NOT EXISTS "Feedback" (
    "feedbackID" SERIAL PRIMARY KEY,
    "answerID" INT UNIQUE REFERENCES "Answer"("answerID") ON DELETE CASCADE,
    "evaluationModelID" INT REFERENCES "EvaluationModel"("modelID") ON DELETE SET NULL,
    "suggestionText" TEXT,
    "generatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS "PerformanceReport" (
    "reportID" SERIAL PRIMARY KEY,
    "sessionID" INT UNIQUE REFERENCES "Session"("sessionID") ON DELETE CASCADE,
    "generatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "totalScore" FLOAT,
    "avgTimePerQuestion" FLOAT,
    "strengths" TEXT,
    "weaknesses" TEXT
);

-- ==============================
-- ADDITIONAL FEATURE TABLES
-- ==============================

-- NOTE: Columns are PascalCase to match your route code exactly.
CREATE TABLE IF NOT EXISTS "SupportTicket" (
    "TicketID" SERIAL PRIMARY KEY,
    "UserID" INT REFERENCES "User"("userID") ON DELETE CASCADE,
    "IssueType" VARCHAR(100),
    "Message" TEXT,
    "Status" "TicketStatus" DEFAULT 'open',
    "CreatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "UpdatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS "FlaggedContent" (
    "flagID" SERIAL PRIMARY KEY,
    "answerID" INT UNIQUE REFERENCES "Answer"("answerID") ON DELETE CASCADE,
    "modelID" INT REFERENCES "EvaluationModel"("modelID"),
    "adminID" INT REFERENCES "User"("userID") ON DELETE SET NULL,
    "reason" TEXT,
    "status" "FlagStatus" DEFAULT 'pending',
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);
