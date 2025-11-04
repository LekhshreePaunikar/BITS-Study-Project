// scripts/seed.js
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') });

console.log('Loaded DB URL:', process.env.DATABASE_URL);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false,
  });

  

const bcrypt = require('bcryptjs');

async function seedUsers() {
  try {
    console.log('Starting to seed users table...');

    // Common password (hashed)
    const password = '123456';
    const passwordHash = await bcrypt.hash(password, 10);

    // Delete existing users (optional for clean seed)
    await pool.query('DELETE FROM users');

    // Admin row
    const admin = {
      userid: 1,
      name: 'AdminUser',
      email: 'admin@example.com',
      password_hash: passwordHash,
      education: 'M.Tech Computer Science',
      experience: '5 years in software development',
      preferred_roles: ['admin'],
      preferred_languages: ['JavaScript', 'Python'],
      isadmin: true,
      isblacklisted: false
    };

    // 10 dummy users
    const users = Array.from({ length: 10 }, (_, i) => ({
      userid: i + 2,
      name: `user${i + 1}`,
      email: `user${i + 1}@gmail.com`,
      password_hash: passwordHash,
      education: 'B.Tech Computer Science',
      experience: '2 years in backend development',
      preferred_roles: ['Software Developer', 'Backend Developer', 'Python Coder'],
      preferred_languages: ['JavaScript', 'Python', 'SQL'],
      isadmin: false,
      isblacklisted: false
    }));

    // Insert admin
    await pool.query(
      `INSERT INTO users 
        (userid, name, email, password_hash, education, experience, preferred_roles, preferred_languages, isadmin, isblacklisted)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        admin.userid,
        admin.name,
        admin.email,
        admin.password_hash,
        admin.education,
        admin.experience,
        admin.preferred_roles,
        admin.preferred_languages,
        admin.isadmin,
        admin.isblacklisted
      ]
    );

    // Insert all users
    for (const user of users) {
        await pool.query(`
          INSERT INTO users ("userid", "name", "email", "password_hash", "education", "experience",
                             "preferred_roles", "preferred_languages", "created_at", "isadmin", "isblacklisted")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9, $10)
        `, [
          user.userid,
          user.name,
          user.email,
          user.password_hash,
          user.education,
          user.experience,
          user.preferred_roles,
          user.preferred_languages,
          user.isadmin,         
          user.isblacklisted
        ]);
      }
      
          
    console.log('Users table seeded successfully!');
  } catch (err) {
    console.error('Error seeding users table:', err);
  } finally {
    await pool.end();
  }
}

seedUsers();
