const express = require("express");
const { upload } = require("../middlewares/upload.middleware");
const { createProductHandler, getProductsHandler } = require("../controllers/product.controller");

const router = express.Router();

router.get("/", getProductsHandler);

router.post(
  "/",
  upload.any(),
  createProductHandler
);

module.exports = router;
