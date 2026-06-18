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

function getFileByField(files, fieldName) {
  if (!Array.isArray(files)) {
    return null;
  }

  return files.find((file) => file.fieldname === fieldName) ?? null;
}

function getFilesByField(files, fieldName) {
  if (!Array.isArray(files)) {
    return [];
  }

  return files.filter((file) => file.fieldname === fieldName);
}

function buildAPlusModuleFileMap(files) {
  const fileMap = new Map();

  (files || []).forEach((file) => {
    const match = file.fieldname.match(/^aPlusModuleImages\[([^\]]+)\]\[([^\]]+)\]$/);
    if (match) {
      fileMap.set(`${match[1]}:${match[2]}`, file);
    }
  });

  return fileMap;
}

async function buildAPlusModules(aPlusModulesRaw, files, folder) {
  if (!Array.isArray(aPlusModulesRaw) || aPlusModulesRaw.length === 0) {
    return [];
  }

  const fileMap = buildAPlusModuleFileMap(files);
  const results = [];

  for (const module of aPlusModulesRaw) {
    const slots = [];

    for (const slot of module.slots || []) {
      if (!slot.hasFile) {
        continue;
      }

      const uploadFile = fileMap.get(`${module.instanceId}:${slot.slotKey}`);
      if (!uploadFile) {
        continue;
      }

      const imageUrl = await uploadSingleFile(uploadFile, folder, "image");
      if (imageUrl) {
        slots.push({
          slotKey: slot.slotKey,
          imageUrl,
        });
      }
    }

    results.push({
      order: module.order,
      instanceId: module.instanceId,
      moduleId: module.moduleId,
      mergeWithNext: Boolean(module.mergeWithNext),
      slots,
    });
  }

  return results;
}

async function createProductHandler(req, res, next) {
  try {
    const {
      sellerId,
      productName,
      sku,
      tagline,
      categoryId,
      basePrice,
      heroEyebrow,
      heroTitle,
      heroDescription,
      bulletPoints,
      videoTitle,
      videoDescription,
      setupSteps,
      aPlusModules,
    } = req.body;

    if (!sellerId || !productName || !heroTitle || !heroDescription) {
      return res.status(400).json({ message: "Zorunlu alanlar eksik." });
    }

    const folder = `lamfer/products/${sellerId}`;
    const uploadedFiles = req.files;
    const heroImageUrl = await uploadSingleFile(getFileByField(uploadedFiles, "heroImage"), folder, "image");
    const videoPosterUrl = await uploadSingleFile(getFileByField(uploadedFiles, "videoPoster"), folder, "image");
    const videoUrl = await uploadSingleFile(getFileByField(uploadedFiles, "videoFile"), folder, "video");
    const galleryImageUrls = await uploadMultipleFiles(getFilesByField(uploadedFiles, "galleryImages"), folder);
    const setupImageUrls = await uploadMultipleFiles(getFilesByField(uploadedFiles, "setupImages"), folder);
    const parsedAPlusModules = parseJsonField(aPlusModules, []);
    const normalizedAPlusModules = await buildAPlusModules(parsedAPlusModules, uploadedFiles, folder);

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
      sku: sku || undefined,
      tagline: tagline || undefined,
      categoryId: categoryId || undefined,
      basePrice: basePrice ? Number(basePrice) : undefined,
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
      aPlusModules: normalizedAPlusModules,
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
