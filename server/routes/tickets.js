const ticketsController = require("../controllers/ticketsController");
const { authenticateToken } = require("../middleware/authMiddleware");
const router = require("express").Router();

const {
  createTicket,
  readTickets,
  updateTicket,
  deleteTicket,
} = ticketsController;

router.post("/", authenticateToken, createTicket);
router.get("/", readTickets);
router.put("/", updateTicket);
router.delete("/", deleteTicket);

module.exports = router;
