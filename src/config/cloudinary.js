const { v2: cloudinary } = require("cloudinary");

let isConfigured = false;

function configureCloudinary() {
  if (isConfigured) {
    return;
  }

  const cloudinaryUrl = process.env.CLOUDINARY_URL;

  if (!cloudinaryUrl) {
    throw new Error("CLOUDINARY_URL environment değişkeni tanımlı değil.");
  }

  cloudinary.config({
    secure: true,
  });

  isConfigured = true;
}

module.exports = {
  cloudinary,
  configureCloudinary,
};
