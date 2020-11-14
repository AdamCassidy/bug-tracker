if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth");
const { getUser } = require("./middleware/authMiddleware");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("combine"));
app.use(cookieParser());

mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});
db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to database"));

app.get("*", getUser);
app.get("/home", (req, res) => {
  res.render("home.vue");
});
app.get("/login", (req, res) => {
  res.render("login.vue");
});
app.get("/signup", (req, res) => {
  res.render("signup.vue");
});
app.use(authRoutes);

app.listen(PORT, () => {
  console.log("Server started on port: " + PORT);
});
