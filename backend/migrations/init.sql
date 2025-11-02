-- root/backend/migrations/init.sql
-- ==============================+
-- ENUM DEFINITIONS
-- ==============================+
DO $$ BEGIN
    CREATE TYPE ModeType AS ENUM ('text', 'voice');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE TicketStatus AS ENUM ('open', 'closed', 'in_progress');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE FlagStatus AS ENUM ('pending', 'resolved');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- DO $$ BEGIN
--     CREATE TYPE EvaluationType AS ENUM ('text', 'speech');
-- EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE DifficultyLevelType AS ENUM ('easy', 'medium', 'hard');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ==============================
-- CORE USER MANAGEMENT TABLES
-- ==============================

CREATE TABLE IF NOT EXISTS "User" (
    "UserID" SERIAL PRIMARY KEY,
    "Name" VARCHAR(100) DEFAULT 'New User',
    "Email" VARCHAR(120) UNIQUE,
    "PasswordHash" TEXT NOT NULL,
    "IsAdmin" BOOLEAN DEFAULT FALSE NOT NULL,
    "IsBlacklisted" BOOLEAN DEFAULT FALSE NOT NULL,
    "Education" TEXT,
    "Experience" TEXT,
    "PreferredRoles" TEXT[],
    "PreferredLanguages" TEXT[],
    "CreatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ==============================
-- CLASSIFICATION TABLES
-- ==============================

CREATE TABLE IF NOT EXISTS "Role" (
    "RoleID" SERIAL PRIMARY KEY,
    "RoleName" VARCHAR(100) NOT NULL,
    "RoleDescription" TEXT
);

CREATE TABLE IF NOT EXISTS "Skill" (
    "SkillID" SERIAL PRIMARY KEY,
    "SkillName" VARCHAR(100) NOT NULL,
    "SkillDescription" TEXT
);

CREATE TABLE IF NOT EXISTS "ProgrammingLanguage" (
    "LangID" SERIAL PRIMARY KEY,
    "LangName" VARCHAR(100) NOT NULL,
    "LangDescription" TEXT
);

CREATE TABLE IF NOT EXISTS "UserProfilePreference" (
    "UserID" INT UNIQUE REFERENCES "User"("UserID") ON DELETE CASCADE ON UPDATE CASCADE,
    "RoleID" INT REFERENCES "Role"("RoleID") ON DELETE SET NULL ON UPDATE CASCADE,
    "SkillID" INT REFERENCES "Skill"("SkillID") ON DELETE SET NULL ON UPDATE CASCADE,
    "LangID" INT REFERENCES "ProgrammingLanguage"("LangID") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Resume" (
    "ResumeID" SERIAL PRIMARY KEY,
    "UserID" INT REFERENCES "User"("UserID") ON DELETE CASCADE,
    "FilePath" TEXT,
    "ParsedSkills" TEXT[],
    "ParsedExperience" TEXT[],
    "ParsedEducation" TEXT[],
    "UploadedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ==============================
-- QUESTION MANAGEMENT TABLES
-- ==============================

CREATE TABLE IF NOT EXISTS "EvaluationModel" (
    "ModelID" SERIAL PRIMARY KEY,
    "ModelName" VARCHAR(100) DEFAULT 'LLM-Model',
    "Description" TEXT
);

-- BaseQuestion = Core question anchor
CREATE TABLE IF NOT EXISTS "BaseQuestion" (
    "QuestionID" SERIAL PRIMARY KEY,
    "IsPredefined" BOOLEAN DEFAULT TRUE NOT NULL,
    "DifficultyLevel" DifficultyLevelType DEFAULT 'easy',
    "CreatedBy" INT REFERENCES "User"("UserID") ON DELETE SET NULL,
    "CreatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "LastUpdated" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- StaticQuestion = Predefined question content (for IsPredefined = TRUE)
CREATE TABLE IF NOT EXISTS "StaticQuestion" (
    "StaticQuestionID" SERIAL PRIMARY KEY,
    "BaseQuestionID" INT UNIQUE REFERENCES "BaseQuestion"("QuestionID") ON DELETE CASCADE,
    "QuestionContent" TEXT NOT NULL,
    "RoleID" INT REFERENCES "Role"("RoleID") ON DELETE SET NULL,
    "SkillID" INT REFERENCES "Skill"("SkillID") ON DELETE SET NULL,
    "LangID" INT REFERENCES "ProgrammingLanguage"("LangID") ON DELETE SET NULL
);

-- DynamicQuestion = AI-generated question content (for IsPredefined = FALSE)
CREATE TABLE IF NOT EXISTS "DynamicQuestion" (
    "DynamicQuestionID" SERIAL PRIMARY KEY,
    "BaseQuestionID" INT UNIQUE REFERENCES "BaseQuestion"("QuestionID") ON DELETE CASCADE,
    "LLMModelID" INT REFERENCES "EvaluationModel"("ModelID") ON DELETE SET NULL,
    "GeneratedQuestionContent" TEXT NOT NULL,
    "ResumeID" INT REFERENCES "Resume"("ResumeID") ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "QuestionResponseMode" (
    "ID" SERIAL PRIMARY KEY,
    "QuestionID" INT UNIQUE REFERENCES "BaseQuestion"("QuestionID") ON DELETE CASCADE,
    "Mode" ModeType NOT NULL
);

-- ==============================
-- INTERVIEW SESSION TABLES
-- ==============================

CREATE TABLE IF NOT EXISTS "Session" (
    "SessionID" SERIAL PRIMARY KEY,
    "UserID" INT REFERENCES "User"("UserID") ON DELETE CASCADE,
    "StartTime" TIMESTAMP DEFAULT NOW() NOT NULL,
    "EndTime" TIMESTAMP DEFAULT NOW() NOT NULL,
    "DifficultyLevelStart" DifficultyLevelType DEFAULT 'easy',
    "DifficultyLevelEnd" DifficultyLevelType DEFAULT 'easy',
    "TotalScore" FLOAT
);

CREATE TABLE IF NOT EXISTS "Answer" (
    "AnswerID" SERIAL PRIMARY KEY,
    "SessionID" INT REFERENCES "Session"("SessionID") ON DELETE CASCADE,
    "QuestionID" INT REFERENCES "BaseQuestion"("QuestionID") ON DELETE CASCADE,
    "ModeChosen" ModeType NOT NULL,
    "AnswerText" TEXT,
    "AnswerAudioPath" TEXT,
    "StartTime" TIMESTAMP DEFAULT NOW() NOT NULL,
    "EndTime" TIMESTAMP DEFAULT NOW() NOT NULL,
    "ScoreContent" FLOAT,
    "ScoreGrammar" FLOAT,
    "ScoreClarity" FLOAT,
    "ScoreFluency" FLOAT,
    "ScoreOverall" FLOAT
);

CREATE TABLE IF NOT EXISTS "SessionHistory" (
    "HistoryID" SERIAL PRIMARY KEY,
    "SessionID" INT REFERENCES "Session"("SessionID") ON DELETE CASCADE,
    "QuestionID" INT REFERENCES "BaseQuestion"("QuestionID"),
    "AnswerID" INT REFERENCES "Answer"("AnswerID"),
    "Timestamp" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ==============================
-- EVALUATION AND FEEDBACK TABLES
-- ==============================

CREATE TABLE IF NOT EXISTS "Feedback" (
    "FeedbackID" SERIAL PRIMARY KEY,
    "AnswerID" INT UNIQUE REFERENCES "Answer"("AnswerID") ON DELETE CASCADE,
    "EvaluationModelID" INT REFERENCES "EvaluationModel"("ModelID") ON DELETE SET NULL,
    "SuggestionText" TEXT,
    "GeneratedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS "PerformanceReport" (
    "ReportID" SERIAL PRIMARY KEY,
    "SessionID" INT UNIQUE REFERENCES "Session"("SessionID") ON DELETE CASCADE,
    "GeneratedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "TotalScore" FLOAT,
    "AvgTimePerQuestion" FLOAT,
    "Strengths" TEXT,
    "Weaknesses" TEXT
);

-- ==============================
-- ADDITIONAL FEATURE TABLES
-- ==============================

CREATE TABLE IF NOT EXISTS "SupportTicket" (
    "TicketID" SERIAL PRIMARY KEY,
    "UserID" INT REFERENCES "User"("UserID") ON DELETE CASCADE,
    "IssueType" VARCHAR(100),
    "Message" TEXT,
    "Status" TicketStatus DEFAULT 'open',
    "CreatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "UpdatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS "FlaggedContent" (
    "FlagID" SERIAL PRIMARY KEY,
    "AnswerID" INT UNIQUE REFERENCES "Answer"("AnswerID") ON DELETE CASCADE,
    "ModelID" INT REFERENCES "EvaluationModel"("ModelID"),
    "AdminID" INT REFERENCES "User"("UserID") ON DELETE SET NULL,
    "Reason" TEXT,
    "Status" FlagStatus DEFAULT 'pending',
    "CreatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "UpdatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);
