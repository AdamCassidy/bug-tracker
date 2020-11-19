if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const projectModel = require("../models/projectModel");

var ObjectId = require("mongoose").Types.ObjectId;

function handleErrors(err) {
  let errors = {};
  console.log(err.message, err.code);
  if (err.message.includes("validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }
  return errors;
}

module.exports.createProject = async (req, res) => {
  try {
    const project = await projectModel.create(req.body);
    project.creator = req.user.user._id;
    if (!project) return res.status(400).send("Can't create project");
    res.json({
      project,
    });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(500).json({ errors });
  }
};
module.exports.readProjects = async (req, res) => {
  try {
    if (req.user.user.role !== "admin")
      return res.status(403).send("Must be an admin");
    const projects = await projectModel.find();
    if (!projects) return res.status(500).send("Can't read projects");
    res.json(projects);
  } catch (err) {
    res.status(500).send(err);
  }
};
module.exports.updateProject = async (req, res) => {
  try {
    const { _id, creator, name } = req.body;
    if (req.user.user._id !== creator) return res.sendStatus(403);
    const hashedPassword = await bcrypt.hash(password, 10);
    const project = await projectModel.findByIdAndUpdate(
      new ObjectId(req.project.project._id),
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
    if (!project) return res.status(500).send("Can't update or create project");
    res.send("Updated project");
  } catch (err) {
    const errors = handleErrors(err);
    res.status(500).json({ errors });
  }
};
module.exports.deleteProject = async (req, res) => {
  try {
    const { _id, name, email, password, role } = req.body;
    if (req.project.project._id !== _id) return res.sendStatus(403);
    const project = await projectModel.findByIdAndDelete(new ObjectId(_id));
    if (!project) return res.status(400).send("Project doesn't exist");
    res.send("Deleted project");
  } catch (err) {
    const errors = handleErrors(err);
    res.status(500).json({ errors });
  }
};
module.exports.login = async (req, res) => {
  try {
    const { _id, name, email, password, role } = req.body;
    const project = await projectModel.findById(new ObjectId(_id));
    if (!project) return res.status(400).send("Project doesn't exist");
    const isMatch = await bcrypt.compare(req.body.password, project.password);
    if (!isMatch) return res.status(400).send("Incorrect name or password");
    const accessToken = await generateAccessToken(project);
    const refreshToken = await generateRefreshToken(project);
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
      async (err, project) => {
        try {
          if (err) return res.sendStatus(403);
          await refreshTokenModel.findByIdAndDelete(
            new ObjectId(refreshToken._id)
          );
          const accessToken = generateAccessToken(project);
          const newRefreshToken = await generateRefreshToken(project);
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
