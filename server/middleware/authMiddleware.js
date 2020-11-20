if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.sendStatus(403);
  // The header format is "Bearer <token>".
  const token = authHeader.split(" ")[1];
  if (token === null) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = {
      _id: user.user._id,
      name: user.user.name,
      email: user.user.email,
      password: user.user.password,
      role: user.user.role,
    };
    next();
  });
};

const authenticateAndGetUser = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.sendStatus(403);
  // The header format is "Bearer <token>".
  const token = authHeader.split(" ")[1];
  if (token === null) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      res.locals.user = null;
      return res.sendStatus(403);
    }
    req.user = {
      _id: user.user._id,
      name: user.user.name,
      email: user.user.email,
      password: user.user.password,
      role: user.user.role,
    };
    res.locals.user = user;
    next();
  });
};

module.exports = { authenticateToken, authenticateAndGetUser };
