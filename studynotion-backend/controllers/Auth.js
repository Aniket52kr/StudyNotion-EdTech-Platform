const bcrypt = require("bcryptjs");
const User = require("../models/User");
const OTP = require("../models/OTP");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
const Profile = require("../models/Profile");
require("dotenv").config();



// Signup Controller for Registering Users
exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword, accountType, contactNumber, otp } = req.body;

    if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
      return res.status(400).json({ success: false, message: "All Fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists. Please sign in." });
    }

    const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
    if (!response.length || otp !== response[0].otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const profileDetails = await Profile.create({ gender: null, dateOfBirth: null, about: null, contactNumber: null });

    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password: hashedPassword,
      accountType,
      approved: accountType !== "Instructor",
      additionalDetails: profileDetails._id,
      image: `https://ui-avatars.com/api/?name=${firstName}+${lastName}`,
    });

    return res.status(201).json({ success: true, user, message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "User registration failed" });
  }
};



// Login Controller
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).populate("additionalDetails");
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ email: user.email, id: user._id, accountType: user.accountType }, process.env.JWT_SECRET, { expiresIn: "24h" });
    user.token = token;
    user.password = undefined;

    res.cookie("token", token, { expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), httpOnly: true })
       .status(200)
       .json({ success: true, token, user, message: "Login successful" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Login failed" });
  }
};



// Send OTP for Email Verification
exports.sendotp = async (req, res) => {
  try {
    const { email } = req.body;
    if (await User.findOne({ email })) {
      return res.status(400).json({ success: false, message: "User already registered" });
    }

    let otp;
    do {
      otp = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
    } while (await OTP.findOne({ otp }));

    await OTP.create({ email, otp });
    res.status(200).json({ success: true, message: "OTP sent successfully", otp });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};



// Change Password
exports.changePassword = async (req, res) => {
  try {
    const userDetails = await User.findById(req.user.id);
    const { oldPassword, newPassword } = req.body;

    if (!(await bcrypt.compare(oldPassword, userDetails.password))) {
      return res.status(401).json({ success: false, message: "Incorrect old password" });
    }

    userDetails.password = await bcrypt.hash(newPassword, 10);
    await userDetails.save();

    try {
      await mailSender(
        userDetails.email,
        "Password Updated",
        passwordUpdated(userDetails.email, `Password updated for ${userDetails.firstName} ${userDetails.lastName}`)
      );
    } catch (error) {
      console.error("Email error:", error);
      return res.status(500).json({ success: false, message: "Error sending email" });
    }

    return res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Password update error:", error);
    return res.status(500).json({ success: false, message: "Failed to update password" });
  }
};