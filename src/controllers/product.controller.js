const { uploadSingleFile, uploadMultipleFiles } = require("../services/cloudinary-upload.service");
const { createProduct, getLatestProduct, getProductsBySellerId } = require("../services/product.service");

function parseJsonField(value, fallback = []) {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

function splitTextToArray(value) {
  if (!value) {
    return [];
  }

  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function createProductHandler(req, res, next) {
  try {
    const {
      sellerId,
      productName,
      heroEyebrow,
      heroTitle,
      heroDescription,
      bulletPoints,
      videoTitle,
      videoDescription,
      setupSteps,
    } = req.body;

    if (!sellerId || !productName || !heroTitle || !heroDescription) {
      return res.status(400).json({ message: "Zorunlu alanlar eksik." });
    }

    const folder = `lamfer/products/${sellerId}`;
    const heroImageUrl = await uploadSingleFile(req.files?.heroImage?.[0], folder, "image");
    const videoPosterUrl = await uploadSingleFile(req.files?.videoPoster?.[0], folder, "image");
    const videoUrl = await uploadSingleFile(req.files?.videoFile?.[0], folder, "video");
    const galleryImageUrls = await uploadMultipleFiles(req.files?.galleryImages, folder);
    const setupImageUrls = await uploadMultipleFiles(req.files?.setupImages, folder);

    const parsedSetupSteps = parseJsonField(setupSteps, []);
    const normalizedSetupSteps = parsedSetupSteps.map((step, index) => ({
      title: step.title ?? `Adım ${index + 1}`,
      description: step.description ?? "",
      tags: Array.isArray(step.tags) ? step.tags : [],
      imageUrl: setupImageUrls[index] ?? "",
    }));

    const payload = {
      sellerId,
      productName,
      heroEyebrow: heroEyebrow || "ENGINEERED FOR THE ELITE",
      heroTitle,
      heroDescription,
      bulletPoints: splitTextToArray(bulletPoints),
      heroImageUrl,
      videoTitle: videoTitle || "VIDEO INSTALLATION GUIDE",
      videoDescription: videoDescription || "",
      videoUrl,
      videoPosterUrl,
      setupSteps: normalizedSetupSteps.filter((step) => step.imageUrl),
      galleryImageUrls,
    };

    const created = await createProduct(payload);
    return res.status(201).json(created);
  } catch (error) {
    return next(error);
  }
}

async function getProductsHandler(req, res, next) {
  try {
    const { sellerId } = req.query;

    if (sellerId) {
      const products = await getProductsBySellerId(String(sellerId));
      return res.json(products);
    }

    const product = await getLatestProduct();
    return res.json(product);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createProductHandler,
  getProductsHandler,
};
