const authController = require("../Controllers/authController");
const router = require("express").Router();
const { authenticateToken } = require("../Middleware/authMiddleware");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const {
  postSignup,
  updateSignup,
  deleteSignup,
  postLogin,
  deleteLogin,
  postToken,
} = authController;

router.post("/signup", postSignup);
router.put("/signup", authenticateToken, updateSignup);
router.delete("/signup", authenticateToken, deleteSignup);
router.post("/login", postLogin);
router.delete("/login", deleteLogin);
router.post("/token", postToken);

module.exports = router;
