const express = require("express");
const { upload } = require("../middlewares/upload.middleware");
const { createProductHandler, updateProductHandler, getProductsHandler, getProductByIdHandler, getPublicProductHandler } = require("../controllers/product.controller");

const router = express.Router();

router.get("/", getProductsHandler);
router.get("/public/:slug/:id", getPublicProductHandler);
router.get("/:id", getProductByIdHandler);

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
