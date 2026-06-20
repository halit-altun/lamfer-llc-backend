const Product = require("../models/product.model");
const {
  AMAZON_ORDER_HISTORY_URL,
  sendReviewFeedbackEmail,
} = require("../services/email.service");
const { getSellerUserByClientId } = require("../services/user.service");

function clampRating(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  return Math.min(5, Math.max(1, Math.round(parsed)));
}

function envSellerEmailFallback() {
  return (
    process.env.SELLER_EMAIL?.trim() ||
    process.env.DEFAULT_SELLER_EMAIL?.trim() ||
    ""
  );
}

async function resolveSellerEmailForProduct(product) {
  const sellerUser = await getSellerUserByClientId(product.sellerId);
  if (sellerUser?.email) {
    return sellerUser.email.trim();
  }

  return envSellerEmailFallback();
}

async function submitAmazonReviewHandler(req, res, next) {
  try {
    const { id } = req.params;
    const { reviewTitle, rating, message } = req.body || {};

    const normalizedTitle = typeof reviewTitle === "string" ? reviewTitle.trim() : "";
    const normalizedRating = clampRating(rating);
    const normalizedMessage = typeof message === "string" ? message.trim() : "";

    if (!normalizedTitle) {
      return res.status(400).json({
        ok: false,
        message: "Please enter a review title.",
      });
    }

    if (!normalizedRating) {
      return res.status(400).json({
        ok: false,
        message: "Please select a rating between 1 and 5.",
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ ok: false, message: "Product not found." });
    }

    if (!product.amazonEnabled) {
      return res.status(400).json({
        ok: false,
        message: "The Amazon section is not enabled for this product.",
      });
    }

    if (!product.amazonReviewRoutingEnabled) {
      return res.status(400).json({
        ok: false,
        message: "Review routing is not enabled for this product.",
      });
    }

    const sellerEmail = await resolveSellerEmailForProduct(product);
    if (!sellerEmail) {
      return res.status(503).json({
        ok: false,
        message: "Seller email could not be found for this product.",
      });
    }

    const targetStars = product.amazonReviewTargetStars ?? 5;

    await sendReviewFeedbackEmail({
      to: sellerEmail,
      productName: product.productName,
      reviewTitle: normalizedTitle,
      rating: normalizedRating,
      message: normalizedMessage,
    });

    const meetsTarget = normalizedRating >= targetStars;

    return res.json({
      ok: true,
      redirectToAmazon: meetsTarget,
      redirectUrl: meetsTarget ? AMAZON_ORDER_HISTORY_URL : null,
      thankYouMessage: meetsTarget
        ? "Thank you for your feedback! Redirecting you to Amazon to leave your review."
        : "Thank you for your feedback. We appreciate your input and are always working to improve your experience.",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  submitAmazonReviewHandler,
};
