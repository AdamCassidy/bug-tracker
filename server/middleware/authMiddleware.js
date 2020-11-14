if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
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
};

const getUser = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (typeof authHeader !== undefined) {
    // The header format is "Bearer <token>".
    const token = authHeader.split(" ")[1];
    if (token === null) return res.sendStatus(401);
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        req.locals.user = null;
        return res.sendStatus(403);
      }
      req.locals.user = user;
      next();
    });
  } else {
    return res.sendStatus(403);
  }
};

module.exports = { authenticateToken, getUser };
