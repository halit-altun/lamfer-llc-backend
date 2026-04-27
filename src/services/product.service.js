const Product = require("../models/product.model");

async function createProduct(payload) {
  const product = await Product.create(payload);
  return product;
}

async function getProductsBySellerId(sellerId) {
  return Product.find({ sellerId }).sort({ createdAt: -1 }).lean();
}

async function getLatestProduct() {
  return Product.findOne().sort({ createdAt: -1 }).lean();
}

module.exports = {
  createProduct,
  getProductsBySellerId,
  getLatestProduct,
};
