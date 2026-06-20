const POSTER_MODES = ["main", "upload", "firstFrame"];

function parsePosterMode(value, existing, fallback = "main") {
  if (POSTER_MODES.includes(value)) {
    return value;
  }
  if (POSTER_MODES.includes(existing)) {
    return existing;
  }
  return fallback;
}

function getCloudinaryVideoFirstFrameUrl(videoUrl) {
  if (
    !videoUrl ||
    !videoUrl.includes("res.cloudinary.com") ||
    !videoUrl.includes("/video/upload/")
  ) {
    return undefined;
  }

  const withTransform = videoUrl.replace(
    "/video/upload/",
    "/video/upload/so_0,w_1600,h_900,c_fill/"
  );

  return withTransform.replace(/\.(mp4|webm|mov|avi|ogv)(\?.*)?$/i, ".jpg$2");
}

function resolveVideoPosterUrl({ mode, customPosterUrl, heroImageUrl, videoUrl }) {
  const normalizedMode = parsePosterMode(mode);

  if (normalizedMode === "upload" && customPosterUrl) {
    return customPosterUrl;
  }

  if (normalizedMode === "firstFrame") {
    const fromCloudinary = getCloudinaryVideoFirstFrameUrl(videoUrl);
    if (fromCloudinary) {
      return fromCloudinary;
    }
  }

  return heroImageUrl || customPosterUrl || undefined;
}

module.exports = {
  parsePosterMode,
  getCloudinaryVideoFirstFrameUrl,
  resolveVideoPosterUrl,
};
