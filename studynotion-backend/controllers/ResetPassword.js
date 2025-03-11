// const User = require("../models/User");
// const mailSender = require("../utils/mailSender");
// const bcrypt = require("bcryptjs");
// const crypto = require("crypto");

// // reset password token:-
// exports.resetPasswordToken = async (req, res) => {
// 	try {
// 		const email = req.body.email;
// 		const user = await User.findOne({ email: email });
// 		if (!user) {
// 			return res.json({
// 				success: false,
// 				message: `This Email: ${email} is not Registered With Us Enter a Valid Email `,
// 			});
// 		}
// 		const token = crypto.randomBytes(20).toString("hex");

// 		const updatedDetails = await User.findOneAndUpdate(
// 			{ email: email },
// 			{
// 				token: token,
// 				resetPasswordExpires: Date.now() + 3600000,
// 			},
// 			{ new: true }
// 		);
// 		console.log("DETAILS", updatedDetails);

// 		const url = `http://localhost:3000/update-password/${token}`;

// 		await mailSender(
// 			email,
// 			"Password Reset",
// 			`Your Link for email verification is ${url}. Please click this url to reset your password.`
// 		);

// 		res.json({
// 			success: true,
// 			message:
// 				"Email Sent Successfully, Please Check Your Email to Continue Further",
// 		});
// 	} catch (error) {
// 		return res.json({
// 			error: error.message,
// 			success: false,
// 			message: `Some Error in Sending the Reset Message`,
// 		});
// 	}
// };



// // reset password:-
// exports.resetPassword = async (req, res) => {
// 	try {
// 		const { password, confirmPassword, token } = req.body;
// 		if (confirmPassword !== password) {
// 			return res.json({
// 				success: false,
// 				message: "Password and Confirm Password Does not Match",
// 			});
// 		}
// 		const userDetails = await User.findOne({ token: token });
// 		if (!userDetails) {
// 			return res.json({
// 				success: false,
// 				message: "Token is Invalid",
// 			});
// 		}
// 		if (!(userDetails.resetPasswordExpires > Date.now())) {
// 			return res.status(403).json({
// 				success: false,
// 				message: `Token is Expired, Please Regenerate Your Token`,
// 			});
// 		}
// 		const encryptedPassword = await bcrypt.hash(password, 10);
// 		await User.findOneAndUpdate(
// 			{ token: token },
// 			{ password: encryptedPassword },
// 			{ new: true }
// 		);
// 		res.json({
// 			success: true,
// 			message: `Password Reset Successful`,
// 		});
// 	} catch (error) {
// 		return res.json({
// 			error: error.message,
// 			success: false,
// 			message: `Some Error in Updating the Password`,
// 		});
// 	}
// };













const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

// Generate reset password token
exports.resetPasswordToken = async (req, res) => {
	try {
		const { email } = req.body;
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(404).json({
				success: false,
				message: `No account found with email: ${email}`,
			});
		}

		// Generate token and hash it
		const token = crypto.randomBytes(32).toString("hex");
		const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

		// Save token in database (hashed) with expiry time (1 hour)
		user.resetPasswordToken = hashedToken;
		user.resetPasswordExpires = Date.now() + 3600000;
		await user.save();

		// Send reset link via email
		const resetUrl = `${process.env.FRONTEND_URL}/update-password/${token}`;

		await mailSender(
			email,
			"Password Reset Request",
			`Click the link below to reset your password:\n\n${resetUrl}\n\nThis link expires in 1 hour.`
		);

		res.json({
			success: true,
			message: "Password reset link sent. Check your email.",
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Error sending reset email.",
			error: error.message,
		});
	}
};

// Reset password
exports.resetPassword = async (req, res) => {
	try {
		const { password, confirmPassword, token } = req.body;

		// Validate passwords
		if (password !== confirmPassword) {
			return res.status(400).json({
				success: false,
				message: "Passwords do not match.",
			});
		}

		// Hash the token and find user
		const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
		const user = await User.findOne({
			resetPasswordToken: hashedToken,
			resetPasswordExpires: { $gt: Date.now() }, // Check if token is still valid
		});

		if (!user) {
			return res.status(400).json({
				success: false,
				message: "Invalid or expired token.",
			});
		}

		// Hash the new password
		const encryptedPassword = await bcrypt.hash(password, 10);

		// Update user password and clear reset token fields
		user.password = encryptedPassword;
		user.resetPasswordToken = undefined;
		user.resetPasswordExpires = undefined;
		await user.save();

		res.json({
			success: true,
			message: "Password reset successful. You can now log in.",
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Error resetting password.",
			error: error.message,
		});
	}
};
