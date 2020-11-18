if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const userModel = require("../models/userModel");
const refreshTokenModel = require("../models/refreshTokenModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

var ObjectId = require("mongoose").Types.ObjectId;

function handleErrors(err) {
  let errors = {};
  console.log(err.message, err.code);
  if (err.code === 11000) {
    errors.email = "Email is already taken";
  } else if (err.message.includes("validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }
  return errors;
}

function generateAccessToken(user) {
  return jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
}

async function generateRefreshToken(user) {
  const tempRefreshToken = {
    user: user._id,
    token: jwt.sign({ user }, process.env.REFRESH_TOKEN_SECRET),
    createdAt: Date.now(),
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
  };
  try {
    const refreshToken = await refreshTokenModel.create(tempRefreshToken);
    if (!refreshToken)
      return res.status(500).send("Not creating refresh token");
    return refreshToken.token;
  } catch (err) {
    const errors = handleErrors(err);
    res.status(500).json({ errors });
  }
}

module.exports.createUser = async (req, res) => {
  try {
    const { email } = req.body;
    const prevUser = await userModel.findOne({ email });
    if (prevUser) return res.status(400).send("User already exists");
    const user = await userModel.create(req.body);
    if (!user) return res.status(400).send("Can't create user");
    const accessToken = await generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);
    /* res.cookie("accessToken", accessToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 15,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    }); */
    res.json({
      user: user,
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(500).json({ errors });
  }
};
module.exports.readUsers = async (req, res) => {
  try {
    if (req.user.user.role !== "admin")
      return res.status(403).send("Must be an admin");
    const users = await userModel.find();
    if (!users) return res.status(500).send("Can't read users");
    res.json(users);
  } catch (err) {
    res.status(500).send(err);
  }
};
module.exports.updateUser = async (req, res) => {
  try {
    const { _id, name, email, password, role } = req.body;
    if (req.user.user._id !== _id) return res.sendStatus(403);
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModel.findByIdAndUpdate(
      new ObjectId(req.user.user._id),
      {
        name,
        email,
        password: hashedPassword,
        role,
      },
      {
        useFindAndModify: false,
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );
    if (!user) return res.status(500).send("Can't update or create user");
    res.send("Updated user");
  } catch (err) {
    const errors = handleErrors(err);
    res.status(500).json({ errors });
  }
};
module.exports.deleteUser = async (req, res) => {
  try {
    const { _id, name, email, password, role } = req.body;
    if (req.user.user._id !== _id) return res.sendStatus(403);
    const user = await userModel.findByIdAndDelete(new ObjectId(_id));
    if (!user) return res.status(400).send("User doesn't exist");
    res.send("Deleted user");
  } catch (err) {
    const errors = handleErrors(err);
    res.status(500).json({ errors });
  }
};
module.exports.login = async (req, res) => {
  try {
    const { _id, name, email, password, role } = req.body;
    const user = await userModel.findById(new ObjectId(_id));
    if (!user) return res.status(400).send("User doesn't exist");
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) return res.status(400).send("Incorrect name or password");
    const accessToken = await generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);
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
};

module.exports.logout = async (req, res) => {
  try {
    const token = await refreshTokenModel.findOne({ token: req.body.token });
    if (!token) return res.sendStatus(401);
    const deleted = await refreshTokenModel.findByIdAndDelete(token._id);
    if (!deleted) res.status(500).send("Can't delete refresh token");
    res.sendStatus(204);
  } catch (err) {
    const errors = handleErrors(err);
    res.status(500).json({ errors });
  }
};

module.exports.generateNewTokens = async (req, res) => {
  try {
    const token = req.body.token;
    if (token === null) return res.sendStatus(401);
    const refreshToken = await refreshTokenModel.findOne({ token });
    if (!refreshToken || refreshToken.isExpired) return res.sendStatus(403);
    jwt.verify(
      refreshToken.token,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, user) => {
        try {
          if (err) return res.sendStatus(403);
          await refreshTokenModel.findByIdAndDelete(
            new ObjectId(refreshToken._id)
          );
          const accessToken = generateAccessToken(user);
          const newRefreshToken = await generateRefreshToken(user);
          if (!newRefreshToken)
            return res.sendStatus(500).send("Can't create new refresh token.");
          res.status(200).send({ accessToken, refreshToken: newRefreshToken });
        } catch (err) {
          const errors = handleErrors(err);
          res.status(500).json({ errors });
        }
      }
    );
  } catch (err) {
    const errors = handleErrors(err);
    res.status(500).json({ errors });
  }
};
