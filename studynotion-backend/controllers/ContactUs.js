const { contactUsEmail } = require("../mail/templates/contactFormRes");
const mailSender = require("../utils/mailSender");



const adminNotificationEmail = (email, firstname, lastname, message, phoneNo, countrycode) => {
  return `
    <h2>New Contact Form Submission</h2>
    <p><strong>Name:</strong> ${firstname} ${lastname}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${countrycode}-${phoneNo}</p>
    <p><strong>Message:</strong> ${message}</p>
  `;
};



exports.contactUsController = async (req, res) => {
  const { email, firstname, lastname, message, phoneNo, countrycode } = req.body;

  // Validate required fields
  if (!email || !firstname || !lastname || !message || !phoneNo || !countrycode) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  console.log("Contact Us Request Data:", req.body);

  try {
    // Send confirmation email to user
    await mailSender(
      email,
      "Your Data was sent successfully",
      contactUsEmail(email, firstname, lastname, message, phoneNo, countrycode)
    );

    // Send notification to admin
    await mailSender(
      process.env.ADMIN_EMAIL, 
      `New Contact Form Submission from ${firstname} ${lastname}`,
      adminNotificationEmail(email, firstname, lastname, message, phoneNo, countrycode)
    );

    return res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    console.error("Error Sending Email:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while sending the email",
      error: error.message,
    });
  }
};