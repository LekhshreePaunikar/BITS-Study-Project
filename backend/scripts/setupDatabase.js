const { query, testConnection } = require('../config/database');

// SQL statements to create all necessary tables
const createTablesSQL = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    google_id VARCHAR(255),
    full_name VARCHAR(255),
    profile_picture VARCHAR(500),
    is_admin BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Interview configurations table
CREATE TABLE IF NOT EXISTS interview_configs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    job_title VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    experience_level VARCHAR(50) CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
    duration INTEGER DEFAULT 30, -- duration in minutes
    question_count INTEGER DEFAULT 5,
    focus_areas TEXT[], -- array of focus areas
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Questions table (for predefined questions)
CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    question_text TEXT NOT NULL,
    category VARCHAR(100),
    difficulty_level VARCHAR(50) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    expected_duration INTEGER DEFAULT 3, -- expected answer duration in minutes
    sample_answer TEXT,
    evaluation_criteria TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Interview sessions table
CREATE TABLE IF NOT EXISTS interview_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    config_id INTEGER REFERENCES interview_configs(id) ON DELETE CASCADE,
    session_status VARCHAR(50) DEFAULT 'in_progress' CHECK (session_status IN ('in_progress', 'completed', 'cancelled')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    total_duration INTEGER, -- actual duration in seconds
    overall_score INTEGER, -- score out of 100
    notes TEXT
);

-- Session questions table (questions asked in a specific session)
CREATE TABLE IF NOT EXISTS session_questions (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES interview_sessions(id) ON DELETE CASCADE,
    question_id INTEGER REFERENCES questions(id),
    question_order INTEGER,
    question_text TEXT NOT NULL, -- stored in case question is modified later
    user_answer TEXT,
    ai_feedback TEXT,
    score INTEGER, -- score out of 100
    time_spent INTEGER, -- time spent in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User feedback table (detailed feedback for each session)
CREATE TABLE IF NOT EXISTS session_feedback (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES interview_sessions(id) ON DELETE CASCADE,
    strengths TEXT[],
    areas_for_improvement TEXT[],
    detailed_feedback TEXT,
    recommendations TEXT[],
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User performance tracking table
CREATE TABLE IF NOT EXISTS user_performance (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10,2),
    metric_date DATE DEFAULT CURRENT_DATE,
    additional_data JSONB,
    UNIQUE(user_id, metric_name, metric_date)
);

-- Admin logs table (for administrative actions)
CREATE TABLE IF NOT EXISTS admin_logs (
    id SERIAL PRIMARY KEY,
    admin_user_id INTEGER REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    target_user_id INTEGER REFERENCES users(id),
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_user_id ON interview_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_session_questions_session_id ON session_questions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_performance_user_id_date ON user_performance(user_id, metric_date);
`;

// Function to insert sample data
const insertSampleData = async () => {
  try {
    // Insert sample admin user
    await query(`
      INSERT INTO users (username, email, password_hash, full_name, is_admin)
      VALUES ('admin', 'admin@email.com', '$2b$10$example_admin_password_hash', 'Admin User', true)
      ON CONFLICT (email) DO NOTHING
    `);

    // Insert sample questions
    const sampleQuestions = [
      {
        text: "Tell me about yourself and your professional background.",
        category: "General",
        difficulty: "beginner",
        duration: 3
      },
      {
        text: "Why are you interested in this position?",
        category: "Motivation",
        difficulty: "beginner", 
        duration: 2
      },
      {
        text: "Describe a challenging project you worked on and how you overcame obstacles.",
        category: "Problem Solving",
        difficulty: "intermediate",
        duration: 4
      },
      {
        text: "How do you handle working under pressure and tight deadlines?",
        category: "Soft Skills",
        difficulty: "intermediate",
        duration: 3
      },
      {
        text: "Where do you see yourself in 5 years?",
        category: "Career Goals",
        difficulty: "beginner",
        duration: 2
      },
      {
        text: "Explain a time when you had to work with a difficult team member.",
        category: "Teamwork",
        difficulty: "intermediate",
        duration: 4
      },
      {
        text: "What are your greatest strengths and weaknesses?",
        category: "Self Assessment",
        difficulty: "beginner",
        duration: 3
      },
      {
        text: "Describe your leadership style and give an example of when you led a team.",
        category: "Leadership",
        difficulty: "advanced",
        duration: 5
      }
    ];

    for (const q of sampleQuestions) {
      await query(`
        INSERT INTO questions (question_text, category, difficulty_level, expected_duration)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT DO NOTHING
      `, [q.text, q.category, q.difficulty, q.duration]);
    }

    console.log(' Sample data inserted successfully');
  } catch (error) {
    console.error(' Error inserting sample data:', error.message);
  }
};

// Main setup function
const setupDatabase = async () => {
  try {
    console.log(' Setting up database tables...');
    
    // Test connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Could not connect to database');
    }

    // Create tables
    await query(createTablesSQL);
    console.log(' Database tables created successfully');
    
    // Insert sample data
    await insertSampleData();
    
    console.log(' Database setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(' Database setup failed:', error.message);
    process.exit(1);
  }
};

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };