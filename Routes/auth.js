if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const router = require("express").Router();
const userModel = require("../Models/userModel");
const refreshTokenModel = require("../Models/refreshTokenModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

var ObjectId = require("mongoose").Types.ObjectId;

router.post("/user", async (req, res) => {
  try {
    const { email } = req.body;
    const prevUser = await userModel.findOne({ email });
    if (prevUser) return res.status(400).send("User already exists");
    const user = await userModel.create(req.body);
    if (!user) return res.status(400).send("Can't create user");
    res.send(true);
  } catch (err) {
    res.status(500).send(err);
  }
});
router.put("/user", authenticateToken, async (req, res) => {
  try {
    const { _id, name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModel.findByIdAndUpdate(
      new ObjectId(_id),
      {
        name,
        email,
        password: hashedPassword,
        role,
      },
      { useFindAndModify: false }
    );
    if (!user || user === {}) return res.status(400).send("User doesn't exist");
    res.send("Updated user");
  } catch (err) {
    res.status(500).send(err);
  }
});
router.delete("/user", authenticateToken, async (req, res) => {
  try {
    const { _id, name, email, password, role } = req.body;
    const user = await userModel.findByIdAndDelete(new ObjectId(_id));
    if (!user) return res.status(400).send("User doesn't exist");
    res.send("Deleted user");
  } catch (err) {
    res.status(500).send(err);
  }
});
// Log in
router.post("/", async (req, res) => {
  try {
    const { _id, name, email, password, role } = req.body;
    const user = await userModel.findById(new ObjectId(_id));
    if (!user) return res.status(400).send("User doesn't exist");
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) return res.status(400).send("Incorrect name or password");
    const accessToken = await generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user, req.ip);
    /* res.cookie("accessToken", accessToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 15,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    }); */
    res.json({ accessToken: accessToken, refreshToken: refreshToken });
  } catch (err) {
    res.status(500).send(err);
  }
});
// Get a new access token
router.post("/token", async (req, res) => {
  try {
    const token = req.body.token;
    if (token === null) return res.sendStatus(401);
    const refreshToken = await refreshTokenModel.findOne({ token });
    if (!refreshToken || refreshToken.isExpired) return res.sendStatus(403);
    jwt.verify(
      refreshToken.token,
      process.env.REFRESH_TOKEN_SECRET,
      (err, user) => {
        if (err) return res.sendStatus(403);
        res.status(200).send(generateAccessToken(user));
      }
    );
  } catch (err) {
    res.status(500).send(err);
  }
});
router.get("/", async (req, res) => {
  try {
    const users = await userModel.find();
    if (!users) return res.status(400).send("No users");
    res.send(users);
  } catch (err) {
    res.status(500).send(err);
  }
});
// Log out
router.delete("/", async (req, res) => {
  try {
    const token = await refreshTokenModel.findOne({ token: req.body.token });
    if (!token) return res.status(401);
    const deleted = await refreshTokenModel.findByIdAndDelete(token._id);
    if (!deleted) res.status(500).send("Can't delete refresh token");
    res.sendStatus(204);
  } catch (err) {
    res.status(500).send(err);
  }
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (typeof authHeader !== undefined) {
    // The header format is "Bearer <token>".
    const token = authHeader.split(" ")[1];
    if (token === null) return res.sendStatus(401);
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  } else {
    return res.sendStatus(403);
  }
}

function generateAccessToken(user) {
  return jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
}

async function generateRefreshToken(user, ip) {
  const tempRefreshToken = {
    user: user.id,
    token: jwt.sign({ user }, process.env.REFRESH_TOKEN_SECRET),
    createdAt: Date.now(),
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
  };
  const refreshToken = await refreshTokenModel.create(tempRefreshToken);
  if (!refreshToken) return res.status(500).send("Not creating refresh token");
  return refreshToken.token;
}

module.exports = router;
