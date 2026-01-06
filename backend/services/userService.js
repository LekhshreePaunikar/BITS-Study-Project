// root/backend/services/userService.js

const { query } = require('../config/database');

// ==============================
// Fetch user profile by ID
// ==============================
exports.getUserProfile = async (userId) => {
  const result = await query(
    `SELECT 
        user_id,
        name,
        email,
        profile_image,
        phone_number,
        location,
        gender,
        education,
        university,
        graduation_year,
        experience,
        experience_level,
        preferred_role,
        skills,
        programming_languages,
        hobbies,
        linkedin_profile,
        github_profile,
        portfolio
     FROM "User"
     WHERE user_id = $1`,
    [userId]
  );

  if (!result.rows[0]) return null;
  const u = result.rows[0];

  return {
    fullName: u.name,
    email: u.email,
    profileImage: u.profile_image,
    phone_number: u.phone_number,
    location: u.location,
    gender: u.gender,
    education: u.education,
    university: u.university,
    graduationYear: u.graduation_year,
    experienceLevel: u.experience_level,
    preferredRole: u.preferred_role,
    skills: u.skills || [],
    programmingLanguages: u.programming_languages || [],
    hobbies: u.hobbies,
    linkedinProfile: u.linkedin_profile,
    githubProfile: u.github_profile,
    portfolio: u.portfolio,
  };
};

// ==============================
// Update user profile
// ==============================
exports.updateUserProfile = async (userId, data) => {
  const {
    fullName, email, gender, phone_number, location,
    preferredRole, skills, programmingLanguages, experienceLevel,
    education, university, graduationYear,
    hobbies, linkedinProfile, githubProfile, portfolio
  } = data;

  const sql = `
    UPDATE "User"
    SET
      name = $1,
      email = $2,
      phone_number = $3,
      location = $4,
      gender = $5,
      preferred_role = $6,
      skills = $7,
      programming_languages = $8,
      experience_level = $9,
      education = $10,
      university = $11,
      graduation_year = $12,
      hobbies = $13,
      linkedin_profile = $14,
      github_profile = $15,
      portfolio = $16,
      updated_at = NOW()
    WHERE user_id = $17
  `;

  const params = [
    fullName,
    email,
    phone_number,
    location,
    gender,
    preferredRole,
    skills,
    programmingLanguages,
    experienceLevel,
    education,
    university,
    graduationYear,
    hobbies,
    linkedinProfile,
    githubProfile,
    portfolio,
    userId
  ];

  await query(sql, params);

  return { success: true };
};

// ==============================
// Update resume path
// ==============================
exports.updateResumePath = async (userId, resumePath) => {
  const sql = `
    UPDATE "User"
    SET resume_path = $1,
        updated_at = NOW()
    WHERE user_id = $2
  `;

  await query(sql, [resumePath, userId]);
  return { success: true };
};

exports.updateProfileImage = async (userId, imagePath) => {
  await query(
    `UPDATE "User"
     SET profile_image = $1, updated_at = NOW()
     WHERE user_id = $2`,
    [imagePath, userId]
  );

  return { success: true };
};

