const Counter = require("../models/counter.model");

async function getNextSequence(name) {
  const counter = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  return counter.seq;
}

async function getNextProductPublicId() {
  return getNextSequence("productPublicId");
}

module.exports = {
  getNextProductPublicId,
};
