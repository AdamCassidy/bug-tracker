if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const helmet = require("helmet");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const redis = require("redis");

const authRoutes = require("./routes/auth");
const projectsRoutes = require("./routes/projects");
const ticketsRoutes = require("./routes/tickets");
const {
  authenticateAndGetUser,
  authenticateToken,
} = require("./middleware/authMiddleware");
const authMiddleware = require("./middleware/authMiddleware");
const authController = require("./controllers/authController");
const app = express();

const PORT = process.env.PORT || 3000;
const REDIS_PORT = process.env.REDIS_PORT || 6379;

const redisClient = redis.createClient(process.env.REDIS_PORT);

redisClient.on("connect", () => {
  console.log("Redis client connected");
});
redisClient.on("error", (error) => {
  console.log("Redis client not connected. Error:", error);
});

authMiddleware.setClient(redisClient);
authController.setClient(redisClient);

/* aws.config.update({
  secretAccessKey: "",
  accessKeyId: "",
  region: ""
}) */

mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to database"));

app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(cookieParser());

app.get("*", authenticateAndGetUser);
app.put("*", authenticateToken);
app.delete("*", authenticateToken);

app.use("/auth", authRoutes);
app.use("/projects", projectsRoutes);
app.use("/tickets", ticketsRoutes);

app.listen(PORT, () => {
  console.log("Server started on port: " + PORT);
});
