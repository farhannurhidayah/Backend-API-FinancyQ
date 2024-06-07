const express = require("express");
const {
  signup,
  verifyOtp,
  login,
  refreshToken,
  logout,
} = require("../controllers/authController");
const {
  getUsers,
  getUserByUsername,
  createUser,
  updateUser,
  deleteUser,
  deleteAllUsers,
} = require("../controllers/userController");
const {
  createEducationContent,
  getAllEducationContents,
  getEducationContentById,
  updateEducationContent,
  deleteEducationContent,
} = require("../controllers/educationContentController");

const authenticateToken = require("../middlewares/auth");

const router = express.Router();

// router.get("/users/", authenticateToken, getUsers);
router.get("/users/:username", authenticateToken, getUserByUsername);
// router.post("/users/", authenticateToken, createUser);
router.put("/users/:username", authenticateToken, updateUser);
router.delete("/users/:username", authenticateToken, deleteUser);
// router.delete("/users/", authenticateToken, deleteAllUsers);

router.post("/signup", signup);
router.post("/verifyotp", verifyOtp);
router.post("/login", login);
// router.post("/token", refreshToken);
router.post("/logout", logout);

// router.post("/education-content", createEducationContent);
router.get("/education-content", getAllEducationContents);
router.get("/education-content/:id", getEducationContentById);
// router.put("/education-content/:id", updateEducationContent);
// router.delete("/education-content/:id", deleteEducationContent);

module.exports = router;
