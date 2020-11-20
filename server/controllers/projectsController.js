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
    const tempProject = req.body;
    tempProject.creator = req.user._id;
    const project = await projectModel.create(tempProject);
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
    if (req.user.role !== "admin")
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
    const { _id, creator, assignedUsers, name } = req.body;
    if (req.user._id !== creator) return res.sendStatus(403);
    const project = await projectModel.findByIdAndUpdate(
      new ObjectId(_id),
      {
        creator,
        assignedUsers,
        name,
      },
      {
        useFindAndModify: false,
        // Create if not in database.
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
    const { _id, creator, assignedUsers, name } = req.body;
    if (req.user._id !== creator) return res.sendStatus(403);
    const project = await projectModel.findByIdAndDelete(new ObjectId(_id));
    if (!project) return res.status(400).send("Project doesn't exist");
    res.send("Deleted project");
  } catch (err) {
    const errors = handleErrors(err);
    res.status(500).json({ errors });
  }
};
