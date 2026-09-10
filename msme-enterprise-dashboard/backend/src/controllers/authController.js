import bcrypt from "bcryptjs";

import User from "../models/User.js";
import Company from "../models/Company.js";
import generateToken from "../utils/generateToken.js";


// ======================================================
// COOKIE OPTIONS
// ======================================================

const cookieOptions = {
  httpOnly: true,

  // false for localhost development
  // true when deployed with HTTPS
  secure: process.env.NODE_ENV === "production",

  // Protects against many CSRF scenarios
  sameSite:
    process.env.NODE_ENV === "production"
      ? "none"
      : "lax",

  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};


// ======================================================
// REGISTER
// Creates COMPANY + FIRST ADMIN USER
// ======================================================

export const register = async (req, res) => {
  try {
    const {
      company,
      user,
    } = req.body;


    // ==================================================
    // VALIDATE REQUEST STRUCTURE
    // ==================================================

    if (!company || !user) {
      return res.status(400).json({
        message:
          "Company information and user information are required",
      });
    }


    const {
      name: companyName,
      industry,
      location,
      employeeCount,
      annualRevenue,
    } = company;


    const {
      name,
      email,
      password,
    } = user;


    // ==================================================
    // VALIDATE COMPANY
    // ==================================================

    if (
      !companyName ||
      !industry ||
      !location
    ) {
      return res.status(400).json({
        message:
          "Company name, industry and location are required",
      });
    }


    // ==================================================
    // VALIDATE USER
    // ==================================================

    if (!name || !email || !password) {
      return res.status(400).json({
        message:
          "Name, email and password are required",
      });
    }


    if (password.length < 6) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters",
      });
    }


    // ==================================================
    // NORMALIZE EMAIL
    // ==================================================

    const normalizedEmail =
      email.toLowerCase().trim();


    // ==================================================
    // CHECK EXISTING USER
    // ==================================================

    const existingUser =
      await User.findOne({
        email: normalizedEmail,
      });


    if (existingUser) {
      return res.status(409).json({
        message:
          "An account with this email already exists",
      });
    }


    // ==================================================
    // HASH PASSWORD
    // ==================================================

    const hashedPassword =
      await bcrypt.hash(password, 12);


    // ==================================================
    // CREATE COMPANY
    // ==================================================

    const newCompany =
      await Company.create({
        name: companyName.trim(),
        industry: industry.trim(),
        location: location.trim(),

        employeeCount:
          employeeCount !== undefined &&
          employeeCount !== ""
            ? Number(employeeCount)
            : undefined,

        annualRevenue:
          annualRevenue !== undefined &&
          annualRevenue !== ""
            ? Number(annualRevenue)
            : undefined,

        isActive: true,
      });


    // ==================================================
    // CREATE FIRST USER AS ADMIN
    // ==================================================

    const newUser =
      await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,

        companyId: newCompany._id,

        // FIRST USER OF COMPANY = ADMIN
        role: "admin",

        isActive: true,
      });


    // ==================================================
    // GENERATE JWT
    // ==================================================

    const token =
      generateToken(newUser._id);


    // ==================================================
    // STORE JWT IN HTTPONLY COOKIE
    // ==================================================

    res.cookie(
      "token",
      token,
      cookieOptions
    );


    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(201).json({
      message:
        "Company and admin account created successfully",

      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        companyId: newUser.companyId,
      },

      company: {
        id: newCompany._id,
        name: newCompany.name,
        industry: newCompany.industry,
        location: newCompany.location,
      },
    });


  } catch (error) {

    console.error(
      "Register Error:",
      error
    );


    return res.status(500).json({
      message:
        "Server error during registration",

      error: error.message,
    });
  }
};


// ======================================================
// LOGIN
// ======================================================

export const login = async (req, res) => {
  try {

    const {
      email,
      password,
    } = req.body;


    // ==================================================
    // VALIDATION
    // ==================================================

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Email and password are required",
      });
    }


    const normalizedEmail =
      email.toLowerCase().trim();


    // ==================================================
    // FIND USER
    // ==================================================

    const user =
      await User
        .findOne({
          email: normalizedEmail,
        })
        .select("+password");


    if (!user) {
      return res.status(401).json({
        message:
          "Invalid email or password",
      });
    }


    // ==================================================
    // CHECK ACTIVE STATUS
    // ==================================================

    if (!user.isActive) {
      return res.status(403).json({
        message:
          "Your account has been deactivated",
      });
    }


    // ==================================================
    // CHECK PASSWORD
    // ==================================================

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );


    if (!passwordMatch) {
      return res.status(401).json({
        message:
          "Invalid email or password",
      });
    }


    // ==================================================
    // GENERATE JWT
    // ==================================================

    const token =
      generateToken(user._id);


    // ==================================================
    // HTTPONLY COOKIE
    // ==================================================

    res.cookie(
      "token",
      token,
      cookieOptions
    );


    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(200).json({
      message:
        "Login successful",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
      },
    });


  } catch (error) {

    console.error(
      "Login Error:",
      error
    );


    return res.status(500).json({
      message:
        "Server error during login",

      error: error.message,
    });
  }
};


// ======================================================
// LOGOUT
// ======================================================

export const logout = async (req, res) => {
  try {

    res.clearCookie(
      "token",
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV ===
          "production",

        sameSite:
          process.env.NODE_ENV ===
          "production"
            ? "none"
            : "lax",
      }
    );


    return res.status(200).json({
      message:
        "Logout successful",
    });


  } catch (error) {

    console.error(
      "Logout Error:",
      error
    );


    return res.status(500).json({
      message:
        "Server error during logout",
    });
  }
};


// ======================================================
// GET CURRENT USER
// ======================================================

export const getCurrentUser = async (
  req,
  res
) => {

  try {

    return res.status(200).json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        companyId: req.user.companyId,
      },
    });


  } catch (error) {

    console.error(
      "Get Current User Error:",
      error
    );


    return res.status(500).json({
      message:
        "Server error",
    });
  }
};