const projectsController = require("../controllers/projectsController");
const { authenticateToken } = require("../middleware/authMiddleware");
const router = require("express").Router();

const {
  createProject,
  readProjects,
  updateProject,
  deleteProject,
} = projectsController;

router.post("/", authenticateToken, createProject);
router.get("/", readProjects);
router.put("/", updateProject);
router.delete("/", deleteProject);

module.exports = router;
