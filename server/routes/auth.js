const authController = require("../controllers/authController");
const router = require("express").Router();
const { authenticateToken } = require("../middleware/authMiddleware");

const {
  createUser,
  updateUser,
  deleteUser,
  login,
  logout,
  getNewTokens,
} = authController;

router.post("/signup", createUser);
router.put("/signup", authenticateToken, updateUser);
router.delete("/signup", authenticateToken, deleteUser);
router.post("/login", login);
router.delete("/login", logout);
router.post("/tokens", getNewTokens);

module.exports = router;
