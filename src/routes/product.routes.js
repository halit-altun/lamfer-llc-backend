const express = require("express");
const { upload } = require("../middlewares/upload.middleware");
const { createProductHandler, updateProductHandler, getProductsHandler, getProductByIdHandler, getPublicProductHandler, getPublicProductByPathHandler } = require("../controllers/product.controller");
const { submitAmazonReviewHandler } = require("../controllers/amazon-review.controller");

const router = express.Router();

router.get("/", getProductsHandler);
router.get("/public/path/:path", getPublicProductByPathHandler);
router.get("/public/:slug/:id", getPublicProductHandler);
router.get("/:id", getProductByIdHandler);

router.post("/:id/amazon-review", submitAmazonReviewHandler);

router.post(
  "/",
  upload.any(),
  createProductHandler
);

router.put(
  "/:id",
  upload.any(),
  updateProductHandler
);

module.exports = router;
