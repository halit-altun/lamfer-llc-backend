const { uploadSingleFile, uploadMultipleFiles } = require("../services/cloudinary-upload.service");
const {
  createProduct,
  getLatestProduct,
  getProductsBySellerId,
  getProductById,
  getProductByPublicId,
  parsePublicIdFromPath,
  updateProductById,
  isSkuTakenBySeller,
} = require("../services/product.service");
const { buildProductPayload, parseOptionalString } = require("../utils/product-payload.builder");

async function assertSkuAvailable(sellerId, sku, excludeProductId = null) {
  const normalizedSku = parseOptionalString(sku);
  if (!normalizedSku) {
    return null;
  }

  const taken = await isSkuTakenBySeller(sellerId, normalizedSku, excludeProductId);
  if (taken) {
    const error = new Error("Bu SKU bu satıcı için zaten kullanılıyor.");
    error.statusCode = 409;
    error.code = "SKU_DUPLICATE";
    throw error;
  }

  return normalizedSku;
}

async function createProductHandler(req, res, next) {
  try {
    const { sellerId, productName, heroTitle, heroDescription } = req.body;

    if (!sellerId || !productName || !heroTitle || !heroDescription) {
      return res.status(400).json({ message: "Zorunlu alanlar eksik." });
    }

    await assertSkuAvailable(sellerId, req.body.sku);

    const payload = await buildProductPayload(req.body, req.files);
    const created = await createProduct(payload);
    return res.status(201).json(created);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        ok: false,
        message: error.message,
        code: error.code,
      });
    }

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

    if (!payload.productName || !payload.heroTitle || !payload.heroDescription) {
      return res.status(400).json({
        ok: false,
        message: "Zorunlu alanlar eksik (ürün adı, hero başlık veya açıklama).",
      });
    }

    await assertSkuAvailable(
      payload.sellerId || existingProduct.sellerId,
      payload.sku,
      req.params.id
    );

    const updated = await updateProductById(req.params.id, payload);
    return res.json(updated);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        ok: false,
        message: error.message,
        code: error.code,
      });
    }

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

async function getPublicProductByPathHandler(req, res, next) {
  try {
    const publicId = parsePublicIdFromPath(req.params.path);

    if (!publicId) {
      return res.status(400).json({ message: "Invalid product URL." });
    }

    const product = await getProductByPublicId(publicId);

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
  getPublicProductByPathHandler,
};
