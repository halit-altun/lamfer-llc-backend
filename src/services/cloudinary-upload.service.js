const { Readable } = require("stream");
const { cloudinary, configureCloudinary } = require("../config/cloudinary");

function bufferToDataUri(file) {
  const base64 = file.buffer.toString("base64");
  return `data:${file.mimetype};base64,${base64}`;
}

function uploadVideoBuffer(file, folder) {
  configureCloudinary();

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "video",
      },
      (error, result) => {
        if (error) {
          const uploadError = new Error(error.message || "Video yüklemesi başarısız oldu.");
          uploadError.statusCode = 400;
          uploadError.code = "CLOUDINARY_VIDEO_UPLOAD_FAILED";
          reject(uploadError);
          return;
        }

        resolve(result.secure_url);
      }
    );

    Readable.from(file.buffer).pipe(uploadStream);
  });
}

async function uploadSingleFile(file, folder, resourceType = "image") {
  if (!file) {
    return null;
  }

  if (resourceType === "video") {
    return uploadVideoBuffer(file, folder);
  }

  configureCloudinary();

  const uploadResult = await cloudinary.uploader.upload(bufferToDataUri(file), {
    folder,
    resource_type: "image",
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
