if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view-engine", "vue");
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());

mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});
db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to database"));

app.use("/auth", require("./Routes/auth.js"));

app.get("/login", (req, res) => {
  res.render("login.vue");
});
app.get("/signup", (req, res) => {
  res.render("signup.vue");
});

app.listen(PORT, () => {
  console.log("Server started on port: " + PORT);
});
