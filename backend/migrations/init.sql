
-- ==============================
-- ENUM DEFINITIONS
-- ==============================
DO $$ BEGIN
    CREATE TYPE ModeType AS ENUM ('text', 'voice');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE TicketStatus AS ENUM ('open', 'closed', 'in_progress');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE FlagStatus AS ENUM ('pending', 'resolved');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE EvaluationType AS ENUM ('text', 'speech');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ==============================
-- CORE USER MANAGEMENT TABLES
-- ==============================

CREATE TABLE IF NOT EXISTS "User" (
    "UserID" SERIAL PRIMARY KEY,
    "Name" VARCHAR(100) NOT NULL,
    "Email" VARCHAR(120) UNIQUE NOT NULL,
    "PasswordHash" TEXT NOT NULL,
    "Education" TEXT,
    "Experience" TEXT,
    "PreferredRoles" TEXT[],
    "PreferredLanguages" TEXT[],
    "CreatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Admin" (
    "AdminID" SERIAL PRIMARY KEY,
    "Name" VARCHAR(100) NOT NULL,
    "Email" VARCHAR(120) UNIQUE NOT NULL,
    "PasswordHash" TEXT NOT NULL
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

-- ==============================
-- QUESTION MANAGEMENT TABLES
-- ==============================

-- 1️⃣ DynamicQuestion (independent table)
CREATE TABLE IF NOT EXISTS "DynamicQuestion" (
    "DynQuestionID" SERIAL PRIMARY KEY,
    "ResumeID" INT,
    "GeneratedQuestionText" TEXT NOT NULL,
    "GeneratedAt" TIMESTAMP DEFAULT NOW()
);

-- 2️⃣ BaseQuestion (references DynamicQuestion)
CREATE TABLE IF NOT EXISTS "BaseQuestion" (
    "QuestionID" SERIAL PRIMARY KEY,
    "Content" TEXT NOT NULL,
    "IsPredefined" BOOLEAN DEFAULT TRUE,
    "CreatedBy" INT REFERENCES "Admin"("AdminID") ON DELETE SET NULL,
    "DynamicSourceID" INT,
    "LastUpdated" TIMESTAMP DEFAULT NOW()
);

-- 3️⃣ Add FK after both tables exist
ALTER TABLE "BaseQuestion"
ADD CONSTRAINT fk_dynamic_source
FOREIGN KEY ("DynamicSourceID")
REFERENCES "DynamicQuestion"("DynQuestionID")
ON DELETE SET NULL;

-- 3️⃣ StaticQuestion (inherits BaseQuestion)
CREATE TABLE IF NOT EXISTS "StaticQuestion" (
    "QuestionID" INT PRIMARY KEY REFERENCES "BaseQuestion"("QuestionID") ON DELETE CASCADE,
    "RoleID" INT REFERENCES "Role"("RoleID") ON DELETE SET NULL,
    "SkillID" INT REFERENCES "Skill"("SkillID") ON DELETE SET NULL,
    "LangID" INT REFERENCES "ProgrammingLanguage"("LangID") ON DELETE SET NULL,
    "DifficultyLevel" INT CHECK ("DifficultyLevel" BETWEEN 1 AND 3)
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
    "StartTime" TIMESTAMP DEFAULT NOW(),
    "EndTime" TIMESTAMP,
    "DifficultyLevelStart" INT,
    "DifficultyLevelEnd" INT,
    "TotalScore" FLOAT
);

CREATE TABLE IF NOT EXISTS "Answer" (
    "AnswerID" SERIAL PRIMARY KEY,
    "SessionID" INT REFERENCES "Session"("SessionID") ON DELETE CASCADE,
    "QuestionID" INT REFERENCES "BaseQuestion"("QuestionID") ON DELETE CASCADE,
    "ModeChosen" ModeType NOT NULL,
    "AnswerText" TEXT,
    "AnswerAudioPath" TEXT,
    "ResponseTimeTaken" INT,
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
    "Timestamp" TIMESTAMP DEFAULT NOW()
);

-- ==============================
-- EVALUATION AND FEEDBACK TABLES
-- ==============================

CREATE TABLE IF NOT EXISTS "Feedback" (
    "FeedbackID" SERIAL PRIMARY KEY,
    "AnswerID" INT UNIQUE REFERENCES "Answer"("AnswerID") ON DELETE CASCADE,
    "SuggestionText" TEXT,
    "GeneratedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "PerformanceReport" (
    "ReportID" SERIAL PRIMARY KEY,
    "SessionID" INT UNIQUE REFERENCES "Session"("SessionID") ON DELETE CASCADE,
    "GeneratedAt" TIMESTAMP DEFAULT NOW(),
    "TotalScore" FLOAT,
    "AvgTimePerQuestion" FLOAT,
    "Strengths" TEXT,
    "Weaknesses" TEXT
);

CREATE TABLE IF NOT EXISTS "EvaluationModel" (
    "ModelID" SERIAL PRIMARY KEY,
    "ModelName" VARCHAR(100) NOT NULL,
    "EvaluationType" EvaluationType NOT NULL,
    "Source" VARCHAR(100),
    "Description" TEXT
);

-- ==============================
-- ADDITIONAL FEATURE TABLES
-- ==============================

CREATE TABLE IF NOT EXISTS "Resume" (
    "ResumeID" SERIAL PRIMARY KEY,
    "UserID" INT REFERENCES "User"("UserID") ON DELETE CASCADE,
    "FilePath" TEXT,
    "ParsedSkills" TEXT[],
    "ParsedExperience" TEXT[],
    "ParsedEducation" TEXT[],
    "UploadedAt" TIMESTAMP DEFAULT NOW()
);

ALTER TABLE "DynamicQuestion"
    ADD CONSTRAINT fk_resume FOREIGN KEY ("ResumeID")
    REFERENCES "Resume"("ResumeID") ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS "SupportTicket" (
    "TicketID" SERIAL PRIMARY KEY,
    "UserID" INT REFERENCES "User"("UserID") ON DELETE CASCADE,
    "IssueType" VARCHAR(100),
    "Message" TEXT,
    "Status" TicketStatus DEFAULT 'open',
    "CreatedAt" TIMESTAMP DEFAULT NOW(),
    "ResolvedAt" TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "FlaggedContent" (
    "FlagID" SERIAL PRIMARY KEY,
    "AnswerID" INT UNIQUE REFERENCES "Answer"("AnswerID") ON DELETE CASCADE,
    "ModelID" INT REFERENCES "EvaluationModel"("ModelID"),
    "AdminID" INT REFERENCES "Admin"("AdminID"),
    "Reason" TEXT,
    "Status" FlagStatus DEFAULT 'pending',
    "CreatedAt" TIMESTAMP DEFAULT NOW()
);
