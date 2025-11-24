// import jwt from "jsonwebtoken";
// import User from "../models/User.js";

// function signToken(user) {
//   if (!process.env.JWT_SECRET) {
//     throw new Error("JWT_SECRET missing");
//   }
//   return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//     expiresIn: "7d",
//   });
// }

// export const register = async (req, res) => {
//   try {
//     const { name, email, phone, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ message: "Email & password required" });
//     }

//     const exists = await User.findOne({ email });
//     if (exists)
//       return res.status(400).json({ message: "Email already registered" });

//     const user = new User({ name, email, phone, password });
//     await user.save();

//     const token = signToken(user);

//     res.json({
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         phone: user.phone,
//       },
//       token,
//     });
//   } catch (err) {
//     console.error("Register error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password)
//       return res.status(400).json({ message: "Email & password required" });

//     const user = await User.findOne({ email });
//     if (!user)
//       return res.status(400).json({ message: "Invalid credentials" });

//     const match = await user.comparePassword(password);
//     if (!match)
//       return res.status(400).json({ message: "Invalid credentials" });

//     const token = signToken(user);

//     res.json({
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         phone: user.phone,
//       },
//       token,
//     });
//   } catch (err) {
//     console.error("Login error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };


import jwt from "jsonwebtoken";
import User from "../models/User.js";
import crypto from "crypto";
import nodemailer from "nodemailer";

// -------------------------
// JWT Sign Function
// -------------------------
function signToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET missing");
  }
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

// -------------------------
// REGISTER
// -------------------------
export const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email & password required" });
    }

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Email already registered" });

    const user = new User({ name, email, phone, password });
    await user.save();

    const token = signToken(user);

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      token,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------------
// LOGIN
// -------------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email & password required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    const match = await user.comparePassword(password);
    if (!match)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = signToken(user);

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ----------------------------------------------------------------------
// 🟢🟢🟢 FORGOT PASSWORD → SEND EMAIL WITH RESET LINK
// ----------------------------------------------------------------------
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "Email not registered" });

    // Create reset token
    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpire = Date.now() + 15 * 60 * 1000; // 15 min
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    // Email setup
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Gmail App Password
      },
    });

    await transporter.sendMail({
      to: email,
      subject: "SmartTree Password Reset",
      html: `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">
          ${resetLink}
        </a>
        <p>This link will expire in 15 minutes.</p>
      `,
    });

    res.json({ success: true, message: "Reset link sent to email!" });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------------------
//  RESET PASSWORD (token sent from email)
// ----------------------------------------------------------------------
// ... keep existing imports at top (crypto, nodemailer, jwt, User, etc)
export const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    if (!password) {
      return res.status(400).json({ success: false, message: "Password is required" });
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: Date.now() }, // Not expired
    });

    if (!user)
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });

    // Check if new password equals old password
    const isSameAsOld = await user.comparePassword(password);
    if (isSameAsOld) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be the same as the old password",
      });
    }

    // Set new password (UserSchema.pre("save") will hash it)
    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;

    await user.save();

    return res.json({ success: true, message: "Password updated successfully!" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
