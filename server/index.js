if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth");
const projectsRoutes = require("./routes/projects");
const {
  authenticateAndGetUser,
  authenticateToken,
} = require("./middleware/authMiddleware");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("combined"));
app.use(cookieParser());

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

app.get("*", authenticateAndGetUser);
app.put("*", authenticateToken);
app.delete("*", authenticateToken);

app.use("/auth", authRoutes);
app.use("/projects", projectsRoutes);

app.listen(PORT, () => {
  console.log("Server started on port: " + PORT);
});
