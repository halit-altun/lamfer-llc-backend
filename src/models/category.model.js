const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, index: true },
    amazonBrowseNodeId: { type: String, trim: true },
    name: {
      en: { type: String, required: true, trim: true },
      tr: { type: String, required: true, trim: true },
    },
    sortOrder: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

categorySchema.index({ "name.en": "text", "name.tr": "text", slug: "text" });

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
