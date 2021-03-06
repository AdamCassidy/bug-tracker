const authController = require("../controllers/authController");
const router = require("express").Router();

const {
  createUser,
  readUsers,
  updateUser,
  deleteUser,
  login,
  logout,
  generateNewTokens,
} = authController;

const { authenticateRefreshToken } = require("../middleware/authMiddleware");

router.post("/signup", createUser);
router.get("/signup", readUsers);
router.put("/signup", updateUser);
router.delete("/signup", deleteUser);
router.post("/login", login);
router.delete("/login", logout);
router.post("/tokens", authenticateRefreshToken, generateNewTokens);

module.exports = router;
