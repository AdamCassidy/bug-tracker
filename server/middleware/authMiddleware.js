if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const jwt = require("jsonwebtoken");
const redis = require("redis");

let redisClient;

module.exports.setClient = (inClient) => {
  redisClient = inClient;
};

module.exports.authenticateToken = (req, res, next) => {
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

module.exports.authenticateAndGetUser = (req, res, next) => {
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

module.exports.authenticateRefreshToken = (req, res, next) => {
  const token = req.body.token;
  if (token === null) return res.sendStatus(401);
  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = {
      _id: user.user._id,
      name: user.user.name,
      email: user.user.email,
      password: user.user.password,
      role: user.user.role,
    };
    redisClient.get(user.user._id.toString(), (err, reply) => {
      if (err) {
        return res.status(403).send(err);
      } else if (reply) {
        req.refreshToken = reply;
        next();
      }
    });
  });
};
