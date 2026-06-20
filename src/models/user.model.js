const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true },
    passwordHash: { type: String },
    companyName: { type: String, trim: true },
    role: { type: String, required: true, trim: true, index: true },
    isActive: { type: Boolean, default: true },
    clientId: { type: String, required: true, unique: true, trim: true, index: true },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
