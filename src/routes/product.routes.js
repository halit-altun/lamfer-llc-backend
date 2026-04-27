const express = require("express");
const { upload } = require("../middlewares/upload.middleware");
const { createProductHandler, getProductsHandler } = require("../controllers/product.controller");

const router = express.Router();

router.get("/", getProductsHandler);

router.post(
  "/",
  upload.fields([
    { name: "heroImage", maxCount: 1 },
    { name: "videoPoster", maxCount: 1 },
    { name: "videoFile", maxCount: 1 },
    { name: "setupImages", maxCount: 20 },
    { name: "galleryImages", maxCount: 20 },
  ]),
  createProductHandler
);

module.exports = router;
