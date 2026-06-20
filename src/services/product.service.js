const Product = require("../models/product.model");
const { getNextProductPublicId } = require("./counter.service");

async function isSkuTakenBySeller(sellerId, sku, excludeProductId = null) {
  const normalizedSku = typeof sku === "string" ? sku.trim() : "";
  if (!normalizedSku) {
    return false;
  }

  const query = { sellerId, sku: normalizedSku };
  if (excludeProductId) {
    query._id = { $ne: excludeProductId };
  }

  return Boolean(await Product.exists(query));
}

async function createProduct(payload) {
  const publicId = payload.publicId ?? (await getNextProductPublicId());
  const product = await Product.create({
    ...payload,
    publicId,
    brandSlug: payload.brandSlug || process.env.DEFAULT_BRAND_SLUG || "lamfer",
  });
  return product;
}

async function getProductsBySellerId(sellerId) {
  return Product.find({ sellerId }).sort({ createdAt: -1 }).lean();
}

async function getLatestProduct() {
  return Product.findOne().sort({ createdAt: -1 }).lean();
}

async function getProductById(id) {
  return Product.findById(id).lean();
}

async function getProductByPublicId(publicId) {
  return Product.findOne({ publicId: Number(publicId) }).lean();
}

function parsePublicIdFromPath(path) {
  const normalized = String(path || "").trim().replace(/^\/+|\/+$/g, "");
  const match = normalized.match(/-(\d+)$/);
  if (!match) {
    return null;
  }

  const publicId = Number(match[1]);
  return Number.isFinite(publicId) && publicId > 0 ? publicId : null;
}

async function updateProductById(id, payload) {
  return Product.findByIdAndUpdate(id, payload, { new: true, runValidators: true }).lean();
}

module.exports = {
  createProduct,
  getProductsBySellerId,
  getLatestProduct,
  getProductById,
  getProductByPublicId,
  parsePublicIdFromPath,
  updateProductById,
  isSkuTakenBySeller,
};
