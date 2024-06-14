const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const generateOTP = require("../utils/otp");
const { sendingmail } = require("../utils/mailSender");

const prisma = new PrismaClient();

// const generateAccessToken = (user) => {
//   return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
// };

//digunakan sebagai AccessToken unruk meakses UserAPI
const generateRefreshToken = (user) => {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
};

//===================================================================================

exports.signup = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password) {
      return res.status(403).send({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username: { equals: username } }, { email: { equals: email } }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Username or email already exists",
      });
    }

    const otp = generateOTP(); // Generate 6 digit OTP

    await prisma.oTP.create({
      data: { email, otp, tempUserData: { username, email, password } },
    });

    await sendingmail(email, otp);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully, please check your email",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error during registration: " + error.message,
    });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(403).send({
        success: false,
        message: "All fields are required",
      });
    }

    const otpEntry = await prisma.oTP.findFirst({
      where: { email, otp },
      orderBy: { createdAt: "desc" },
    });

    if (!otpEntry) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    const expirationTime = new Date(
      otpEntry.createdAt.getTime() + 5 * 60 * 1000
    );
    if (new Date() > expirationTime) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Retrieve temporary user data from OTP table
      const tempUserData = otpEntry.tempUserData;

      if (!tempUserData) {
        return res.status(400).json({
          success: false,
          message: "Temporary user data not found",
        });
      }

      const { username, password } = tempUserData;

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      user = await prisma.user.create({
        data: { username, email, password: hashedPassword },
      });
    }

    // Clean up OTP entry
    await prisma.oTP.delete({ where: { id: otpEntry.id } });

    res.status(200).json({
      success: true,
      message: "User verified successfully, please login to continue",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error during verification: " + error.message,
    });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: "User not found" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(400).json({ message: "Invalid password" });

    // const accessToken = generateAccessToken({
    //   id: user.id,
    //   username: user.username,
    // });
    if (user.refreshToken) {
      return res.status(200).json({ message: "You are already logged in" });
    }

    const refreshToken = generateRefreshToken({
      id: user.id,
      username: user.username,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    res.json({
      userId: user.id,
      username: user.username,
      email: user.email,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// exports.refreshToken = async (req, res) => {
//   const { token } = req.body;
//   if (!token) return res.sendStatus(401);

//   try {
//     const user = await prisma.user.findFirst({
//       where: { refreshToken: token },
//     });
//     if (!user) return res.sendStatus(403);

//     jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
//       if (err) return res.sendStatus(403);

//       const accessToken = generateAccessToken({
//         id: user.id,
//         username: user.username,
//       });
//       res.json({ accessToken });
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

exports.logout = async (req, res) => {
  const { token } = req.body;

  try {
    const user = await prisma.user.updateMany({
      where: { refreshToken: token },
      data: { refreshToken: null },
    });

    if (user.count === 0) {
      return res
        .status(400)
        .json({ error: "Invalid token or user already logged out" });
    }

    // Combine status code and message in a single response
    return res.status(200).json({ message: "User logged out Succesfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
