const { cloudinary, configureCloudinary } = require("../config/cloudinary");

function bufferToDataUri(file) {
  const base64 = file.buffer.toString("base64");
  return `data:${file.mimetype};base64,${base64}`;
}

async function uploadSingleFile(file, folder, resourceType = "image") {
  if (!file) {
    return null;
  }

  configureCloudinary();

  const uploadResult = await cloudinary.uploader.upload(bufferToDataUri(file), {
    folder,
    resource_type: resourceType,
  });

  return uploadResult.secure_url;
}

async function uploadMultipleFiles(files, folder) {
  if (!files?.length) {
    return [];
  }

  const uploadJobs = files.map((file) => uploadSingleFile(file, folder, "image"));
  return Promise.all(uploadJobs);
}

module.exports = {
  uploadSingleFile,
  uploadMultipleFiles,
};
