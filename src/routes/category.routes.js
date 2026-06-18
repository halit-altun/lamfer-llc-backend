const express = require("express");
const {
  getCategoriesHandler,
  getCategoryByIdHandler,
} = require("../controllers/category.controller");

const router = express.Router();

router.get("/", getCategoriesHandler);
router.get("/:id", getCategoryByIdHandler);

module.exports = router;
