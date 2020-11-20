if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const ticketModel = require("../models/ticketModel");

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

module.exports.createTicket = async (req, res) => {
  try {
    const tempTicket = req.body;
    tempTicket.creator = req.user._id;
    const ticket = await ticketModel.create(tempTicket);
    if (!ticket) return res.status(400).send("Can't create ticket");
    res.json({
      ticket,
    });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(500).json({ errors });
  }
};
module.exports.readTickets = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).send("Must be an admin");
    const tickets = await ticketModel.find();
    if (!tickets) return res.status(500).send("Can't read tickets");
    res.json(tickets);
  } catch (err) {
    res.status(500).send(err);
  }
};
module.exports.updateTicket = async (req, res) => {
  try {
    const { _id, creator, assignedUsers, subject, text, priority } = req.body;
    if (creator !== req.user._id) return res.sendStatus(403);
    const updatedTicket = await ticketModel.findOneAndUpdate(
      { $and: [{ _id }, { creator }] },

      {
        assignedUsers,
        subject,
        text,
        priority,
      },
      {
        useFindAndModify: false,
        // Create if not in database.
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );
    if (!updatedTicket)
      return res.status(500).send("Can't update or create ticket");
    res.send("Updated ticket");
  } catch (err) {
    const errors = handleErrors(err);
    res.status(500).json({ errors });
  }
};
module.exports.deleteTicket = async (req, res) => {
  try {
    const { _id, creator } = req.body;
    if (req.user._id !== creator) return res.sendStatus(403);
    const ticket = await ticketModel.findOneAndDelete({
      $and: [{ _id }, { creator }],
    });
    if (!ticket) return res.status(400).send("Ticket doesn't exist");
    res.send("Deleted ticket");
  } catch (err) {
    const errors = handleErrors(err);
    res.status(500).json({ errors });
  }
};
