import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Company from "../models/Company.js";
import generateToken from "../utils/generateToken.js";

export const register = async (req, res) => {
  try {
    const { name, email, password, companyId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    if (companyId) {
      const company = await Company.findById(companyId);

      if (!company) {
        return res.status(404).json({
          success: false,
          message: "Company not found",
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      companyId: companyId || null,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          companyId: user.companyId,
          role: user.role,
        },
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email: email?.toLowerCase(),
    }).select("+password");

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    return res.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          companyId: user.companyId,
          role: user.role,
        },
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};