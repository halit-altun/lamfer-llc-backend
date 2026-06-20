const { uploadSingleFile, uploadMultipleFiles } = require("../services/cloudinary-upload.service");

function parseJsonField(value, fallback = []) {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch {
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

function parseOptionalNumber(value) {
  if (value === undefined || value === null || String(value).trim() === "") {
    return undefined;
  }

  const normalized = String(value).trim().replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function parseOptionalString(value) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed || undefined;
}

function parseBoolean(value) {
  return value === true || value === "true" || value === 1 || value === "1";
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
      if (slot.hasFile) {
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
        continue;
      }

      if (slot.imageUrl) {
        slots.push({
          slotKey: slot.slotKey,
          imageUrl: slot.imageUrl,
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

async function buildProductPayload(body, files, existingProduct = null) {
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
    videoUrl: videoUrlFromBody,
    architectureTitle,
    featureCards,
    setupSteps,
    aPlusModules,
    amazonEnabled,
    amazonReviewTitle,
    amazonStoreUrl,
    amazonIncentiveCopy,
    clearHeroImage,
  } = body;

  const folder = `lamfer/products/${sellerId || existingProduct?.sellerId || "unknown"}`;
  const uploadedFiles = files || [];

  const uploadedHeroImageUrl = await uploadSingleFile(
    getFileByField(uploadedFiles, "heroImage"),
    folder,
    "image"
  );
  const heroImageUrl = uploadedHeroImageUrl
    ? uploadedHeroImageUrl
    : parseBoolean(clearHeroImage)
      ? undefined
      : existingProduct?.heroImageUrl || undefined;

  const uploadedVideoPosterUrl = await uploadSingleFile(
    getFileByField(uploadedFiles, "videoPoster"),
    folder,
    "image"
  );
  const uploadedVideoUrl = await uploadSingleFile(
    getFileByField(uploadedFiles, "videoFile"),
    folder,
    "video"
  );

  const newGalleryImageUrls = await uploadMultipleFiles(
    getFilesByField(uploadedFiles, "galleryImages"),
    folder
  );
  const setupImageUrls = await uploadMultipleFiles(
    getFilesByField(uploadedFiles, "setupImages"),
    folder
  );

  const parsedAPlusModules = parseJsonField(aPlusModules, null);
  const normalizedAPlusModules =
    parsedAPlusModules === null
      ? existingProduct?.aPlusModules || []
      : await buildAPlusModules(parsedAPlusModules, uploadedFiles, folder);

  const parsedSetupSteps = parseJsonField(setupSteps, null);
  let normalizedSetupSteps = existingProduct?.setupSteps || [];

  if (parsedSetupSteps !== null) {
    let setupImageIndex = 0;
    normalizedSetupSteps = parsedSetupSteps.map((step, index) => {
      let imageUrl = step.imageUrl || "";

      if (!imageUrl && setupImageUrls[setupImageIndex]) {
        imageUrl = setupImageUrls[setupImageIndex];
        setupImageIndex += 1;
      }

      return {
        stepNumber: step.stepNumber ? String(step.stepNumber) : String(index + 1).padStart(2, "0"),
        title: step.title ?? `Adım ${index + 1}`,
        description: step.description ?? "",
        tags: Array.isArray(step.tags) ? step.tags : [],
        imageUrl,
      };
    });
  }

  const parsedFeatureCards = parseJsonField(featureCards, null);
  const normalizedFeatureCards = Array.isArray(parsedFeatureCards)
    ? parsedFeatureCards
        .filter((card) => card?.title && card?.description)
        .map((card) => ({
          icon: String(card.icon || "verified").trim(),
          title: String(card.title).trim(),
          description: String(card.description).trim(),
        }))
    : existingProduct?.featureCards || [];

  const galleryImageUrls =
    newGalleryImageUrls.length > 0
      ? [...(existingProduct?.galleryImageUrls || []), ...newGalleryImageUrls]
      : existingProduct?.galleryImageUrls || [];

  const resolvedVideoUrl =
    uploadedVideoUrl || parseOptionalString(videoUrlFromBody) || existingProduct?.videoUrl;
  const resolvedVideoPosterUrl =
    uploadedVideoPosterUrl || heroImageUrl || existingProduct?.videoPosterUrl || undefined;

  const amazonFieldsProvided =
    amazonEnabled !== undefined ||
    amazonReviewTitle !== undefined ||
    amazonStoreUrl !== undefined ||
    amazonIncentiveCopy !== undefined;

  return {
    sellerId: sellerId || existingProduct?.sellerId,
    productName: productName ?? existingProduct?.productName,
    sku: parseOptionalString(sku) ?? existingProduct?.sku,
    tagline: parseOptionalString(tagline) ?? existingProduct?.tagline,
    categoryId: categoryId || existingProduct?.categoryId,
    basePrice:
      parseOptionalNumber(basePrice) ??
      (existingProduct?.basePrice !== undefined ? existingProduct.basePrice : undefined),
    heroEyebrow:
      parseOptionalString(heroEyebrow) ||
      existingProduct?.heroEyebrow ||
      "ENGINEERED FOR THE ELITE",
    heroTitle: heroTitle ?? existingProduct?.heroTitle,
    heroDescription: heroDescription ?? existingProduct?.heroDescription,
    bulletPoints: bulletPoints !== undefined ? splitTextToArray(bulletPoints) : existingProduct?.bulletPoints || [],
    heroImageUrl,
    videoTitle:
      parseOptionalString(videoTitle) ||
      existingProduct?.videoTitle ||
      "VIDEO INSTALLATION GUIDE",
    videoDescription:
      parseOptionalString(videoDescription) ?? existingProduct?.videoDescription,
    videoUrl: resolvedVideoUrl,
    videoPosterUrl: resolvedVideoPosterUrl,
    architectureTitle:
      parseOptionalString(architectureTitle) ??
      existingProduct?.architectureTitle ??
      "Aerospace Architecture",
    featureCards: normalizedFeatureCards,
    setupSteps: normalizedSetupSteps.filter((step) => step.imageUrl),
    galleryImageUrls,
    aPlusModules: normalizedAPlusModules,
    amazonEnabled: amazonFieldsProvided
      ? parseBoolean(amazonEnabled)
      : Boolean(existingProduct?.amazonEnabled),
    amazonReviewTitle:
      parseOptionalString(amazonReviewTitle) ?? existingProduct?.amazonReviewTitle,
    amazonStoreUrl: parseOptionalString(amazonStoreUrl) ?? existingProduct?.amazonStoreUrl,
    amazonIncentiveCopy:
      parseOptionalString(amazonIncentiveCopy) ?? existingProduct?.amazonIncentiveCopy,
  };
}

module.exports = {
  buildProductPayload,
  parseOptionalNumber,
};
