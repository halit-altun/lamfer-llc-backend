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

const careGuidelineSchema = new mongoose.Schema(
  {
    icon: { type: String, trim: true, default: "warning" },
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
    title: { type: String, trim: true },
    mergeWithNext: { type: Boolean, default: false },
    slots: [aPlusModuleSlotSchema],
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    sellerId: { type: String, required: true, index: true },
    publicId: { type: Number, unique: true, sparse: true, index: true },
    brandSlug: { type: String, trim: true, default: "lamfer" },
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
    mainPictureIncludeInHeader: { type: Boolean, default: true },
    videoTitle: { type: String, trim: true },
    videoDescription: { type: String, trim: true },
    videoUrl: { type: String, trim: true },
    videoPosterUrl: { type: String, trim: true },
    videoPosterMode: { type: String, trim: true, default: "main" },
    watchInActionEnabled: { type: Boolean, default: false },
    watchInActionVideoUrl: { type: String, trim: true },
    watchInActionPosterUrl: { type: String, trim: true },
    watchInActionPosterMode: { type: String, trim: true, default: "main" },
    setupSteps: [setupStepSchema],
    setupStepsEyebrow: { type: String, trim: true },
    setupStepsTitle: { type: String, trim: true },
    setupStepsHeadingMode: { type: String, trim: true, default: "default" },
    galleryImageUrls: [{ type: String, trim: true }],
    aPlusModules: [aPlusModuleSchema],
    architectureTitle: { type: String, trim: true, default: "Aerospace Architecture" },
    featureCards: [featureCardSchema],
    careGuidelines: [careGuidelineSchema],
    careGuidelinesEyebrow: { type: String, trim: true },
    careGuidelinesTitle: { type: String, trim: true },
    careGuidelinesHeadingMode: { type: String, trim: true, default: "default" },
    amazonEnabled: { type: Boolean, default: false },
    amazonReviewTitle: { type: String, trim: true },
    amazonStoreUrl: { type: String, trim: true },
    amazonIncentiveCopy: { type: String, trim: true },
    amazonReviewTargetStars: { type: Number, min: 1, max: 5, default: 5 },
    amazonReviewRoutingEnabled: { type: Boolean, default: false },
    marketplaceLinks: [
      {
        marketplaceId: { type: String, required: true, trim: true },
        url: { type: String, required: true, trim: true },
      },
    ],
    sellerNotificationEmail: { type: String, trim: true },
    darkLandingBgPaletteId: { type: String, trim: true, default: "dark-charcoal" },
    lightLandingBgPaletteId: { type: String, trim: true, default: "light-snow" },
    defaultLandingThemeMode: { type: String, trim: true, default: "dark", enum: ["dark", "light"] },
    brandStoreUrl: { type: String, trim: true },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.index(
  { sellerId: 1, sku: 1 },
  {
    unique: true,
    partialFilterExpression: {
      sku: { $type: "string", $gt: "" },
    },
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
