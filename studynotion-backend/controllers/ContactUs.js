// const { contactUsEmail } = require("../mail/templates/contactFormRes")
// const mailSender = require("../utils/mailSender")


// // contactus:-
// exports.contactUsController = async (req, res) => {
//   const { email, firstname, lastname, message, phoneNo, countrycode } = req.body
//   console.log(req.body)
//   try {
//     const emailRes = await mailSender(
//       email,
//       "Your Data send successfully",
//       contactUsEmail(email, firstname, lastname, message, phoneNo, countrycode)
//     )
//     console.log("Email Res ", emailRes)
//     return res.json({
//       success: true,
//       message: "Email send successfully",
//     })
//   } catch (error) {
//     console.log("Error", error)
//     console.log("Error message :", error.message)
//     return res.json({
//       success: false,
//       message: "Something went wrong...",
//     })
//   }
// }











const { contactUsEmail } = require("../mail/templates/contactFormRes");
const mailSender = require("../utils/mailSender");

// Contact Us Controller
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
    const emailRes = await mailSender(
      email,
      "Your Data was sent successfully",
      contactUsEmail(email, firstname, lastname, message, phoneNo, countrycode)
    );

    console.log("Email Response:", emailRes);
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
