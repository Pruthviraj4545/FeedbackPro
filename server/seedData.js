/**
 * seedData.js  –  run with: npm run seed
 * Populates DB with admin, faculty members, students, subjects and sample feedback.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Subject = require('./models/Subject');
const Feedback = require('./models/Feedback');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Wipe existing data
  await Promise.all([User.deleteMany(), Subject.deleteMany(), Feedback.deleteMany()]);
  console.log('Cleared existing data');

  // ── Admin ────────────────────────────────────────────────
  const admin = await User.create({
    name: 'System Admin',
    email: 'admin@feedback.com',
    password: 'admin123',
    role: 'admin',
    department: 'Administration',
  });

  // ── Faculty ──────────────────────────────────────────────
  const [f1, f2, f3] = await User.create([
    { name: 'Dr. Priya Sharma',  email: 'priya@feedback.com',  password: 'faculty123', role: 'faculty', department: 'Computer Science' },
    { name: 'Prof. Rahul Verma', email: 'rahul@feedback.com',  password: 'faculty123', role: 'faculty', department: 'Information Technology' },
    { name: 'Dr. Anjali Mehta',  email: 'anjali@feedback.com', password: 'faculty123', role: 'faculty', department: 'Electronics' },
  ]);

  // ── Subjects ─────────────────────────────────────────────
  const [s1, s2, s3, s4] = await Subject.create([
    { name: 'Data Structures',        code: 'CS301', department: 'Computer Science',       semester: 3, faculty: f1._id },
    { name: 'Web Development',        code: 'CS402', department: 'Computer Science',       semester: 4, faculty: f1._id },
    { name: 'Database Management',    code: 'IT301', department: 'Information Technology', semester: 3, faculty: f2._id },
    { name: 'Digital Electronics',    code: 'EC201', department: 'Electronics',            semester: 2, faculty: f3._id },
  ]);

  // ── Students ─────────────────────────────────────────────
  const [st1, st2, st3] = await User.create([
    { name: 'Aditya Kumar',   email: 'aditya@feedback.com',  password: 'student123', role: 'student', department: 'Computer Science', rollNumber: 'CS21001' },
    { name: 'Sneha Patel',    email: 'sneha@feedback.com',   password: 'student123', role: 'student', department: 'Computer Science', rollNumber: 'CS21002' },
    { name: 'Rohan Joshi',    email: 'rohan@feedback.com',   password: 'student123', role: 'student', department: 'Information Technology', rollNumber: 'IT21001' },
  ]);

  // ── Feedback ─────────────────────────────────────────────
  await Feedback.create([
    { student: st1._id, subject: s1._id, faculty: f1._id, rating: 5, comment: 'Excellent teaching! Concepts explained very clearly.', teachingQuality: 5, subjectClarity: 4, availability: 5 },
    { student: st1._id, subject: s2._id, faculty: f1._id, rating: 4, comment: 'Good practical coverage, more projects would help.', teachingQuality: 4, subjectClarity: 4, availability: 4 },
    { student: st2._id, subject: s1._id, faculty: f1._id, rating: 4, comment: 'Very approachable and helpful during doubts.', teachingQuality: 4, subjectClarity: 5, availability: 3 },
    { student: st2._id, subject: s2._id, faculty: f1._id, rating: 3, comment: 'Could improve assignment feedback turnaround time.', teachingQuality: 3, subjectClarity: 4, availability: 3 },
    { student: st3._id, subject: s3._id, faculty: f2._id, rating: 5, comment: 'Best DB professor! Real-world examples are very helpful.', teachingQuality: 5, subjectClarity: 5, availability: 4 },
  ]);

  console.log('\n✅ Seed complete! Login credentials:');
  console.log('Admin   → admin@feedback.com    / admin123');
  console.log('Faculty → priya@feedback.com    / faculty123');
  console.log('Faculty → rahul@feedback.com    / faculty123');
  console.log('Student → aditya@feedback.com   / student123');
  console.log('Student → sneha@feedback.com    / student123');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => { console.error(err); process.exit(1); });
