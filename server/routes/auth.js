const authController = require("../controllers/authController");
const router = require("express").Router();
const { authenticateToken } = require("../middleware/authMiddleware");

const {
  createUser,
  readSignup,
  updateUser,
  deleteUser,
  login,
  readLogin,
  logout,
  getNewAccessToken,
} = authController;

router.post("/signup", createUser);
router.get("/signup", readSignup);
router.put("/signup", authenticateToken, updateUser);
router.delete("/signup", authenticateToken, deleteUser);
router.post("/login", login);
router.get("/login", readLogin);
router.delete("/login", logout);
router.post("/token", getNewAccessToken);

module.exports = router;
