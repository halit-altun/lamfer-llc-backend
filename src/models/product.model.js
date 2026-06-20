const mongoose = require("mongoose");

const setupStepSchema = new mongoose.Schema(
  {
    stepNumber: { type: String, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    tags: [{ type: String, trim: true }],
    imageUrl: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const featureCardSchema = new mongoose.Schema(
  {
    icon: { type: String, trim: true, default: "verified" },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const aPlusModuleSlotSchema = new mongoose.Schema(
  {
    slotKey: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const aPlusModuleSchema = new mongoose.Schema(
  {
    order: { type: Number, required: true },
    instanceId: { type: String, required: true, trim: true },
    moduleId: { type: String, required: true, trim: true },
    mergeWithNext: { type: Boolean, default: false },
    slots: [aPlusModuleSlotSchema],
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    sellerId: { type: String, required: true, index: true },
    productName: { type: String, required: true, trim: true },
    sku: { type: String, trim: true },
    tagline: { type: String, trim: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", index: true },
    basePrice: { type: Number, min: 0 },
    heroEyebrow: { type: String, required: true, trim: true },
    heroTitle: { type: String, required: true, trim: true },
    heroDescription: { type: String, required: true, trim: true },
    bulletPoints: [{ type: String, trim: true }],
    heroImageUrl: { type: String, trim: true },
    videoTitle: { type: String, trim: true },
    videoDescription: { type: String, trim: true },
    videoUrl: { type: String, trim: true },
    videoPosterUrl: { type: String, trim: true },
    setupSteps: [setupStepSchema],
    galleryImageUrls: [{ type: String, trim: true }],
    aPlusModules: [aPlusModuleSchema],
    architectureTitle: { type: String, trim: true, default: "Aerospace Architecture" },
    featureCards: [featureCardSchema],
    amazonEnabled: { type: Boolean, default: false },
    amazonReviewTitle: { type: String, trim: true },
    amazonStoreUrl: { type: String, trim: true },
    amazonIncentiveCopy: { type: String, trim: true },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
