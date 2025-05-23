const router = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  sendVerificationEmail,
  verifyToken,
} = require("../middleware/sendVerificationEmail");
//SIGN IN APIs
router.post("/sign-in", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ username });
    const existingEmail = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    } else if (username.length < 4) {
      return res
        .status(400)
        .json({ message: "Username should have at least 4 characters" });
    }
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashPass = await bcrypt.hash(password, 10);
    await sendVerificationEmail(username, email, hashPass);

    return res.status(200).json({
      message:
        "Sign-up successful! Please check your email to verify your account.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//Login
router.post("/log-in", async (req, res) => {
  const { username, password } = req.body;
  const existingUser = await User.findOne({ username: username });
  if (!existingUser) {
    return res.status(400).json({ message: "Invalid Credentials" });
  }
  bcrypt.compare(password, existingUser.password, (err, data) => {
    if (data) {
      const authClaims = [{ name: username }, { jti: jwt.sign({}, process.env.JWT_SECRET) }];
      const token = jwt.sign({ authClaims }, process.env.JWT_SECRET, { expiresIn: "2d" });
      res.status(200).json({ id: existingUser._id, token: token });
    } else {
      return res.status(400).json({ message: "Invalid Credentials" });
    }
  });
});

//verify-email
router.get("/verify-email", async (req, res) => {
  const { token } = req.query;

  try {
    const { username, email, password } = verifyToken(token);

    const newUser = new User({ username, email, password });
    await newUser.save();

    res.status(200).json({
      message: "Email verified successfully! Your account has been created.",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
module.exports = router;