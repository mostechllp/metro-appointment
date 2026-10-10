require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');
const Admin = require('../models/Admin');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

(async () => {
  try {
    console.log('\n🔧  Metro StarCare — Create Admin\n');

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Allow passing args: node createAdmin.js email pass name
    let email = process.argv[2];
    let password = process.argv[3];
    let name = process.argv[4];

    if (!email) email = await ask('📧 Admin email: ');
    if (!password) password = await ask('🔒 Admin password (min 6 chars): ');
    if (!name) name = (await ask('👤 Name (optional): ')) || 'Administrator';

    email = email.trim().toLowerCase();

    if (!email || !password) {
      console.error('❌ Email and password are required');
      process.exit(1);
    }
    if (password.length < 6) {
      console.error('❌ Password must be at least 6 characters');
      process.exit(1);
    }

    const existing = await Admin.findOne({ email });
    if (existing) {
      console.log(`\n⚠️  Admin with email ${email} already exists.`);
      rl.close();
      process.exit(0);
    }

    const admin = await Admin.create({ email, password, name });

    console.log('\n✅ Admin created successfully!\n');
    console.log('   📧 Email:    ', admin.email);
    console.log('   👤 Name:     ', admin.name);
    console.log('   🎭 Role:     ', admin.role);
    console.log('\n   Use these credentials on /admin/login\n');

    rl.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();