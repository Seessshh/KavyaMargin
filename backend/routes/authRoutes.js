import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js'; 
import Employee from '../models/Employee.js';

const router = express.Router();

// POST: /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, userRole, contactNo, address } = req.body;

    // 1. Normalize the email immediately so "Name@..." and "name@..." are identical
    const normalizedEmail = email.toLowerCase().trim();

    // ==========================================
    // 2. HR DATABASE VERIFICATION
    // ==========================================
    
    // Escape special characters in name (like dots) to prevent regex crashes
    const safeName = fullName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const employeeRecord = await Employee.findOne({ 
      name: new RegExp('^' + safeName + '$', 'i') 
    });

    if (!employeeRecord) {
      return res.status(403).json({ 
        message: "Employee record not found. Please ask HR to add you to the Employee Cost module before registering." 
      });
    }

    // Verify work email matches (Comparing strictly in lowercase)
    const officialEmail = (employeeRecord.email || employeeRecord.workEmail || '').toLowerCase().trim();
    
    if (!officialEmail) {
       return res.status(403).json({ 
        message: "No official work email found in your HR record. Please contact administration." 
      });
    }

    if (normalizedEmail !== officialEmail) {
      return res.status(403).json({ 
        message: `Security Alert: The email provided does not match your official work email on file (${employeeRecord.email || employeeRecord.workEmail}).` 
      });
    }

    // --- CASE-INSENSITIVE ROLE MATCHING ---
    const dbRoleLower = (employeeRecord.role || '').toLowerCase().trim();
    let allowedRole = 'Viewers'; 
    
    // Map the lowercase DB role to the exact casing your frontend expects
    if (dbRoleLower === 'super admin') allowedRole = 'Super Admin';
    else if (dbRoleLower === 'company admin') allowedRole = 'Company Admin';
    else if (dbRoleLower === 'project manager') allowedRole = 'Project Manager';
    else if (dbRoleLower === 'hr') allowedRole = 'HR';
    else if (dbRoleLower === 'team lead') allowedRole = 'Team Lead';

    if (userRole !== allowedRole) {
      return res.status(403).json({ 
        message: `Role mismatch. Your official HR designation is '${employeeRecord.role}', so you are only authorized to register as a '${allowedRole}'.` 
      });
    }

    // ==========================================
    // 3. STANDARD REGISTRATION LOGIC
    // ==========================================

    // Use the normalized lowercase email for the DB check
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "An account with this email already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email: normalizedEmail, // ALWAYS save the lowercase version
      password: hashedPassword,
      userRole,
      contactNo,
      address
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Server error during registration." });
  }
});

// POST: /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Normalize email for login so uppercase typos don't lock users out
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check if the user exists
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // 2. Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // 3. Send successful response
    res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        userRole: user.userRole,
        contactNo: user.contactNo,
        address: user.address
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error during login." });
  }
});

export default router;