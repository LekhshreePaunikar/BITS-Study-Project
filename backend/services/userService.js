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
        resume_path,
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
    resumePath: u.resume_path,
    phone_number: u.phone_number,
    location: u.location,
    gender: u.gender,
    education: u.education,
    university: u.university,
    graduation_year: u.graduation_year,
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
    fullName, gender, phone_number, location,
    preferredRole, skills, programmingLanguages, experienceLevel,
    education, university, graduation_year, 
    hobbies, linkedinProfile, githubProfile, portfolio
  } = data;

  const sanitizedGraduationYear = graduation_year && graduation_year !== '' 
    ? parseInt(graduation_year, 10) 
    : null;

  const sql = `
    UPDATE "User"
    SET
      name = $1,
      phone_number = $2,
      location = $3,
      gender = $4,
      preferred_role = $5,
      skills = $6,
      programming_languages = $7,
      experience_level = $8,
      education = $9,
      university = $10,
      graduation_year = $11,
      hobbies = $12,
      linkedin_profile = $13,
      github_profile = $14,
      portfolio = $15,
      updated_at = NOW()
    WHERE user_id = $16
  `;

  const params = [
    fullName, 
    phone_number || null,  
    location, 
    gender, 
    preferredRole,
    skills, 
    programmingLanguages, 
    experienceLevel, 
    education,
    university, 
    sanitizedGraduationYear,  
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