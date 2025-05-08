const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

// Temporary store for user data before email verification
const tempUserStore = {};

// Initialize Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // Or your preferred email service (e.g., sendgrid, mailgun)
  auth: {
    user: process.env.EMAIL_USER, // Make sure these are set in your .env file and Vercel environment variables
    pass: process.env.EMAIL_PASS,   // Make sure these are set in your .env file and Vercel environment variables
  },
});

async function sendVerificationEmail(username, email, password) {
  const token = jwt.sign(
    { username, email, password }, // Storing password in JWT for verification email is not ideal, consider alternatives if security is paramount
    process.env.JWT_SECRET,
    { expiresIn: "15m" } // Token expires in 15 minutes
  );

  // Store user data temporarily with an expiry
  tempUserStore[token] = {
    username,
    email,
    password, // Storing hashed password temporarily
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes from now
  };

  // Construct the verification link
  // Ensure FRONTEND_URL is set in your environment variables (e.g., http://localhost:3000 or your production frontend URL)
  console.log(`Current FRONTEND_URL: ${process.env.FRONTEND_URL}`); // Debugging FRONTEND_URL
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: `TaskHub <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "TaskHub - Email Verification",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #007bff;">Welcome to TaskHub, ${username}!</h2>
        <p>Thank you for signing up. To complete your registration, please verify your email address by clicking the link below:</p>
        <p style="text-align: center;">
          <a href="${verificationLink}" 
             style="display: inline-block; background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 16px;"
             target="_blank">Verify Email Address</a>
        </p>
        <p>This verification link will expire in 15 minutes.</p>
        <p>If you did not request this email, please ignore it. Your account will not be created until you verify your email.</p>
        <hr style="border: 0; border-top: 1px solid #eee;">
        <p style="font-size: 0.9em; color: #777;">
          If you're having trouble clicking the button, copy and paste the URL below into your web browser:
          <br>
          <a href="${verificationLink}" target="_blank">${verificationLink}</a>
        </p>
        <p style="font-size: 0.9em; color: #777;">Thank you,<br>The TaskHub Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent successfully to ${email}. Token: ${token}`);
  } catch (error) {
    console.error("Error sending verification email:", error);
    // Provide more specific feedback based on error type if possible
    if (error.code === 'EAUTH' || error.responseCode === 535) {
        console.error("Nodemailer authentication failed. Please check your EMAIL_USER and EMAIL_PASS environment variables.");
        throw new Error("Failed to send verification email due to authentication issues. Please contact support if this persists.");
    } else if (error.code === 'EENVELOPE') {
        console.error("Nodemailer envelope error. This could be an issue with the 'from' or 'to' email addresses.");
        throw new Error("Failed to send verification email due to an issue with email addresses. Please check your email and try again.");
    }
    throw new Error("Failed to send verification email. Please try again later or contact support.");
  }
}

function verifyToken(token) {
  try {
    // Clean up expired tokens from the store (simple garbage collection)
    for (const t in tempUserStore) {
      if (tempUserStore[t].expires < Date.now()) {
        delete tempUserStore[t];
        console.log(`Cleaned up expired token data for token: ${t}`);
      }
    }

    const userData = tempUserStore[token];

    if (!userData) {
      console.error(`Token not found in tempUserStore: ${token}`);
      throw new Error("Invalid or expired verification token. User data not found.");
    }

    if (userData.expires < Date.now()) {
      delete tempUserStore[token];
      console.error(`Token expired for user ${userData.username}: ${token}`);
      throw new Error("Verification token has expired. Please sign up again.");
    }

    // Verify the JWT itself (redundant if tempUserStore is the source of truth after initial creation, but good for integrity)
    const decodedFromJwt = jwt.verify(token, process.env.JWT_SECRET);

    // Optional: Cross-check data if needed, though primary check is existence and expiry in tempUserStore
    if (decodedFromJwt.username !== userData.username || decodedFromJwt.email !== userData.email) {
        console.error(`Token data mismatch for token: ${token}. JWT: ${JSON.stringify(decodedFromJwt)}, Store: ${JSON.stringify(userData)}`);
        delete tempUserStore[token]; // Remove inconsistent token data
        throw new Error("Token data integrity error. Please sign up again.");
    }

    // Successfully verified, remove from temp store
    delete tempUserStore[token];
    console.log(`Token verified successfully for user ${userData.username}. Data removed from temp store.`);

    return { username: userData.username, email: userData.email, password: userData.password };
  } catch (error) {
    console.error("Error during token verification:", error.message);
    if (error.name === "TokenExpiredError") {
      // This case might be caught by the tempUserStore expiry check already
      throw new Error("Verification token has expired (JWT). Please sign up again.");
    } else if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid verification token (JWT). Please sign up again.");
    }
    // Rethrow the original or a more generic error
    throw new Error(error.message || "Failed to verify token. Please sign up again.");
  }
}

module.exports = { sendVerificationEmail, verifyToken };
