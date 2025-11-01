// backend/services/userService.js
const { query } = require('../config/database');

// ==============================
// Fetch user profile by ID
// ==============================
exports.getUserProfile = async (userId) => {
  const result = await query(
    `SELECT "UserID", "Name", "Email", "Phone", "Location", "Gender",
            "Education", "University", "GraduationYear", "ExperienceLevel",
            "PreferredRole", "Skills", "ProgrammingLanguages",
            "Hobbies", "LinkedInProfile", "GithubProfile", "Portfolio"
     FROM "User"
     WHERE "UserID" = $1`,
    [userId]
  );
  // Map DB column names to frontend state keys (if different)
  if (!result.rows[0]) return null;
  const user = result.rows[0];
  return {
    fullName: user.Name,
    email: user.Email,
    phone: user.Phone,
    location: user.Location,
    gender: user.Gender,
    education: user.Education,
    university: user.University,
    graduationYear: user.GraduationYear,
    experienceLevel: user.ExperienceLevel,
    preferredRole: user.PreferredRole,
    skills: user.Skills || [], // Assume skills/languages are stored as arrays
    programmingLanguages: user.ProgrammingLanguages || [],
    hobbies: user.Hobbies,
    linkedinProfile: user.LinkedInProfile,
    githubProfile: user.GithubProfile,
    portfolio: user.Portfolio,
    // Note: Password and ResumeFile are not fetched
  };
};

// ==============================
// Update user profile
// ==============================
exports.updateUserProfile = async (userId, data) => {
  const {
    fullName, email, password, gender, phone, location,
    preferredRole, skills, programmingLanguages, experienceLevel,
    education, university, graduationYear,
    hobbies, linkedinProfile, githubProfile, portfolio,
    // Note: resumeFile is typically handled by a separate file upload service
  } = data;

  // IMPORTANT: For simplicity, we are NOT updating the password or email here.
  // Password updates should use a separate secure route. Email changes usually require verification.

  const sql = `
    UPDATE "User"
    SET
      "Name" = $1,
      "Phone" = $2,
      "Location" = $3,
      "Gender" = $4,
      "PreferredRole" = $5,
      "Skills" = $6,
      "ProgrammingLanguages" = $7,
      "ExperienceLevel" = $8,
      "Education" = $9,
      "University" = $10,
      "GraduationYear" = $11,
      "Hobbies" = $12,
      "LinkedInProfile" = $13,
      "GithubProfile" = $14,
      "Portfolio" = $15
    WHERE "UserID" = $16
  `;

  const params = [
    fullName, phone, location, gender,
    preferredRole, skills, programmingLanguages, experienceLevel,
    education, university, graduationYear,
    hobbies, linkedinProfile, githubProfile, portfolio,
    userId
  ];

  await query(sql, params);

  return { success: true };
};

// ... other exports ...