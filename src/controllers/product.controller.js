const { uploadSingleFile, uploadMultipleFiles } = require("../services/cloudinary-upload.service");
const {
  createProduct,
  getLatestProduct,
  getProductsBySellerId,
  getProductById,
  updateProductById,
} = require("../services/product.service");
const { buildProductPayload } = require("../utils/product-payload.builder");

async function createProductHandler(req, res, next) {
  try {
    const { sellerId, productName, heroTitle, heroDescription } = req.body;

    if (!sellerId || !productName || !heroTitle || !heroDescription) {
      return res.status(400).json({ message: "Zorunlu alanlar eksik." });
    }

    const payload = await buildProductPayload(req.body, req.files);
    const created = await createProduct(payload);
    return res.status(201).json(created);
  } catch (error) {
    return next(error);
  }
}

async function updateProductHandler(req, res, next) {
  try {
    const existingProduct = await getProductById(req.params.id);

    if (!existingProduct) {
      return res.status(404).json({ message: "Ürün bulunamadı." });
    }

    const payload = await buildProductPayload(req.body, req.files, existingProduct);
    const updated = await updateProductById(req.params.id, payload);
    return res.json(updated);
  } catch (error) {
    return next(error);
  }
}

async function getProductsHandler(req, res, next) {
  try {
    const { sellerId } = req.query;

    if (sellerId) {
      const products = await getProductsBySellerId(String(sellerId));
      return res.json(products);
    }

    const product = await getLatestProduct();
    return res.json(product);
  } catch (error) {
    return next(error);
  }
}

async function getProductByIdHandler(req, res, next) {
  try {
    const product = await getProductById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Ürün bulunamadı." });
    }

    return res.json(product);
  } catch (error) {
    return next(error);
  }
}

async function getPublicProductHandler(req, res, next) {
  try {
    const product = await getProductById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Ürün bulunamadı." });
    }

    return res.json(product);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createProductHandler,
  updateProductHandler,
  getProductsHandler,
  getProductByIdHandler,
  getPublicProductHandler,
};
