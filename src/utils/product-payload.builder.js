const { uploadSingleFile, uploadMultipleFiles } = require("../services/cloudinary-upload.service");
const { parsePosterMode } = require("./video-poster.utils");

const MAX_VIDEO_FILE_SIZE_BYTES = 30 * 1024 * 1024;

function assertVideoFileSize(file, fieldLabel) {
  if (file && file.size > MAX_VIDEO_FILE_SIZE_BYTES) {
    const error = new Error(`${fieldLabel} must not exceed 30 MB`);
    error.statusCode = 400;
    throw error;
  }
}

function validateVideoUploads(files) {
  if (!Array.isArray(files)) {
    return;
  }

  for (const file of files) {
    if (file.fieldname === "videoFile") {
      assertVideoFileSize(file, "Installation video");
    }
    if (file.fieldname === "watchInActionVideoFile") {
      assertVideoFileSize(file, "Watch in Action video");
    }
  }
}

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

function parseSetupStepsHeadingMode(value, fallback = "default") {
  return value === "custom" ? "custom" : fallback === "custom" ? "custom" : "default";
}

function parseCareGuidelinesHeadingMode(value, fallback = "default") {
  return value === "custom" ? "custom" : fallback === "custom" ? "custom" : "default";
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

function resolveNonEmptyString(value, fallback) {
  const parsed = parseOptionalString(value);
  return parsed ?? fallback;
}

function parseBoolean(value) {
  return value === true || value === "true" || value === 1 || value === "1";
}

function parseStarRating(value, fallback = 5) {
  if (value === undefined || value === null || String(value).trim() === "") {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(5, Math.max(1, Math.round(parsed)));
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
      title: parseOptionalString(module.title),
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
    videoPosterMode,
    watchInActionEnabled,
    watchInActionVideoUrl: watchInActionVideoUrlFromBody,
    watchInActionPosterMode,
    architectureTitle,
    setupStepsEyebrow,
    setupStepsTitle,
    setupStepsHeadingMode,
    featureCards,
    careGuidelines,
    careGuidelinesEyebrow,
    careGuidelinesTitle,
    careGuidelinesHeadingMode,
    setupSteps,
    aPlusModules,
    amazonEnabled,
    amazonReviewTitle,
    amazonStoreUrl,
    amazonIncentiveCopy,
    amazonReviewTargetStars,
    amazonReviewRoutingEnabled,
    marketplaceLinks,
    sellerNotificationEmail,
    darkLandingBgPaletteId,
    lightLandingBgPaletteId,
    defaultLandingThemeMode,
    brandStoreUrl,
    mainPictureIncludeInHeader,
    clearHeroImage,
    clearVideo,
    clearWatchInActionVideo,
  } = body;

  const folder = `lamfer/products/${sellerId || existingProduct?.sellerId || "unknown"}`;
  const uploadedFiles = files || [];
  validateVideoUploads(uploadedFiles);

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
  const uploadedWatchInActionPosterUrl = await uploadSingleFile(
    getFileByField(uploadedFiles, "watchInActionPoster"),
    folder,
    "image"
  );
  const uploadedVideoUrl = await uploadSingleFile(
    getFileByField(uploadedFiles, "videoFile"),
    folder,
    "video"
  );
  const uploadedWatchInActionVideoUrl = await uploadSingleFile(
    getFileByField(uploadedFiles, "watchInActionVideoFile"),
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

  const parsedCareGuidelines = parseJsonField(careGuidelines, null);
  const normalizedCareGuidelines = Array.isArray(parsedCareGuidelines)
    ? parsedCareGuidelines
        .filter((item) => item?.title && item?.description)
        .map((item) => ({
          icon: String(item.icon || "warning").trim(),
          title: String(item.title).trim(),
          description: String(item.description).trim(),
        }))
    : existingProduct?.careGuidelines || [];

  const galleryImageUrls =
    newGalleryImageUrls.length > 0
      ? [...(existingProduct?.galleryImageUrls || []), ...newGalleryImageUrls]
      : existingProduct?.galleryImageUrls || [];

  const resolvedVideoUrl = parseBoolean(clearVideo)
    ? undefined
    : uploadedVideoUrl ??
      (videoUrlFromBody !== undefined
        ? parseOptionalString(videoUrlFromBody)
        : existingProduct?.videoUrl);
  const hasVideo = Boolean(resolvedVideoUrl);

  const resolvedWatchInActionVideoUrl = parseBoolean(clearWatchInActionVideo)
    ? undefined
    : uploadedWatchInActionVideoUrl ??
      (watchInActionVideoUrlFromBody !== undefined
        ? parseOptionalString(watchInActionVideoUrlFromBody)
        : existingProduct?.watchInActionVideoUrl);

  const videoPosterModeResolved = hasVideo
    ? parsePosterMode(videoPosterMode, existingProduct?.videoPosterMode)
    : "main";
  const storedVideoPosterUrl =
    hasVideo && videoPosterModeResolved === "upload"
      ? uploadedVideoPosterUrl ?? existingProduct?.videoPosterUrl ?? undefined
      : undefined;

  const hasWatchInActionVideo = Boolean(resolvedWatchInActionVideoUrl);
  const watchInActionPosterModeResolved = hasWatchInActionVideo
    ? parsePosterMode(watchInActionPosterMode, existingProduct?.watchInActionPosterMode)
    : "main";
  const storedWatchInActionPosterUrl =
    hasWatchInActionVideo && watchInActionPosterModeResolved === "upload"
      ? uploadedWatchInActionPosterUrl ??
        existingProduct?.watchInActionPosterUrl ??
        undefined
      : undefined;

  const watchInActionEnabledResolved =
    watchInActionEnabled !== undefined
      ? parseBoolean(watchInActionEnabled)
      : Boolean(existingProduct?.watchInActionEnabled);

  const amazonFieldsProvided =
    amazonEnabled !== undefined ||
    amazonReviewTitle !== undefined ||
    amazonStoreUrl !== undefined ||
    amazonIncentiveCopy !== undefined ||
    amazonReviewTargetStars !== undefined ||
    amazonReviewRoutingEnabled !== undefined ||
    sellerNotificationEmail !== undefined;

  const parsedMarketplaceLinks = parseJsonField(marketplaceLinks, null);
  const normalizedMarketplaceLinks = Array.isArray(parsedMarketplaceLinks)
    ? parsedMarketplaceLinks
        .filter((link) => link?.marketplaceId && link?.url?.trim())
        .map((link) => ({
          marketplaceId: String(link.marketplaceId).trim(),
          url: String(link.url).trim(),
        }))
        .filter((link) => link.marketplaceId !== "amazon")
    : existingProduct?.marketplaceLinks || [];

  const setupStepsHeadingModeResolved =
    setupStepsHeadingMode !== undefined
      ? parseSetupStepsHeadingMode(setupStepsHeadingMode)
      : parseSetupStepsHeadingMode(existingProduct?.setupStepsHeadingMode, "default");

  const careGuidelinesHeadingModeResolved =
    careGuidelinesHeadingMode !== undefined
      ? parseCareGuidelinesHeadingMode(careGuidelinesHeadingMode)
      : parseCareGuidelinesHeadingMode(existingProduct?.careGuidelinesHeadingMode, "default");

  return {
    sellerId: sellerId || existingProduct?.sellerId,
    productName: resolveNonEmptyString(productName, existingProduct?.productName),
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
    heroTitle: resolveNonEmptyString(heroTitle, existingProduct?.heroTitle),
    heroDescription: resolveNonEmptyString(heroDescription, existingProduct?.heroDescription),
    bulletPoints: bulletPoints !== undefined ? splitTextToArray(bulletPoints) : existingProduct?.bulletPoints || [],
    heroImageUrl,
    mainPictureIncludeInHeader:
      mainPictureIncludeInHeader !== undefined
        ? parseBoolean(mainPictureIncludeInHeader)
        : existingProduct?.mainPictureIncludeInHeader ?? true,
    videoTitle: hasVideo
      ? parseOptionalString(videoTitle) ||
        existingProduct?.videoTitle ||
        "VIDEO INSTALLATION GUIDE"
      : videoTitle !== undefined
        ? parseOptionalString(videoTitle)
        : existingProduct?.videoTitle,
    videoDescription: hasVideo
      ? parseOptionalString(videoDescription) ?? existingProduct?.videoDescription
      : videoDescription !== undefined
        ? parseOptionalString(videoDescription)
        : existingProduct?.videoDescription,
    videoUrl: resolvedVideoUrl,
    videoPosterUrl: storedVideoPosterUrl,
    videoPosterMode: hasVideo ? videoPosterModeResolved : "main",
    watchInActionEnabled: watchInActionEnabledResolved,
    watchInActionVideoUrl: resolvedWatchInActionVideoUrl,
    watchInActionPosterUrl: storedWatchInActionPosterUrl,
    watchInActionPosterMode: hasWatchInActionVideo ? watchInActionPosterModeResolved : "main",
    architectureTitle:
      parseOptionalString(architectureTitle) ??
      existingProduct?.architectureTitle ??
      "Aerospace Architecture",
    setupStepsEyebrow:
      setupStepsHeadingModeResolved === "custom"
        ? parseOptionalString(setupStepsEyebrow) ??
          existingProduct?.setupStepsEyebrow ??
          undefined
        : undefined,
    setupStepsTitle:
      setupStepsHeadingModeResolved === "custom"
        ? parseOptionalString(setupStepsTitle) ?? existingProduct?.setupStepsTitle ?? undefined
        : undefined,
    setupStepsHeadingMode: setupStepsHeadingModeResolved,
    featureCards: normalizedFeatureCards,
    careGuidelines: normalizedCareGuidelines,
    careGuidelinesEyebrow:
      careGuidelinesHeadingModeResolved === "custom"
        ? parseOptionalString(careGuidelinesEyebrow) ??
          existingProduct?.careGuidelinesEyebrow ??
          undefined
        : undefined,
    careGuidelinesTitle:
      careGuidelinesHeadingModeResolved === "custom"
        ? parseOptionalString(careGuidelinesTitle) ?? existingProduct?.careGuidelinesTitle ?? undefined
        : undefined,
    careGuidelinesHeadingMode: careGuidelinesHeadingModeResolved,
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
    amazonReviewTargetStars: amazonReviewTargetStars !== undefined
      ? parseStarRating(amazonReviewTargetStars)
      : (existingProduct?.amazonReviewTargetStars ?? 5),
    amazonReviewRoutingEnabled: amazonReviewRoutingEnabled !== undefined
      ? parseBoolean(amazonReviewRoutingEnabled)
      : Boolean(existingProduct?.amazonReviewRoutingEnabled),
    marketplaceLinks: normalizedMarketplaceLinks,
    sellerNotificationEmail:
      sellerNotificationEmail !== undefined
        ? parseOptionalString(sellerNotificationEmail)
        : existingProduct?.sellerNotificationEmail,
    darkLandingBgPaletteId:
      parseOptionalString(darkLandingBgPaletteId) ??
      existingProduct?.darkLandingBgPaletteId ??
      "dark-charcoal",
    lightLandingBgPaletteId:
      parseOptionalString(lightLandingBgPaletteId) ??
      existingProduct?.lightLandingBgPaletteId ??
      "light-snow",
    defaultLandingThemeMode:
      defaultLandingThemeMode === "light" || defaultLandingThemeMode === "dark"
        ? defaultLandingThemeMode
        : existingProduct?.defaultLandingThemeMode ?? "dark",
    brandStoreUrl:
      brandStoreUrl !== undefined
        ? parseOptionalString(brandStoreUrl)
        : existingProduct?.brandStoreUrl,
  };
}

module.exports = {
  buildProductPayload,
  parseOptionalNumber,
  parseOptionalString,
};
