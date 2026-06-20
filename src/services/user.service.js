const User = require("../models/user.model");

const LEGACY_SELLER_ID = "seller-001";

async function getSellerUserByClientId(clientId) {
  const normalizedId = String(clientId || "").trim();
  if (!normalizedId) {
    return null;
  }

  const user = await User.findOne({
    clientId: normalizedId,
    role: { $regex: /^seller$/i },
    isActive: { $ne: false },
  })
    .select("email clientId companyName")
    .lean();

  if (user) {
    return user;
  }

  if (normalizedId === LEGACY_SELLER_ID) {
    return User.findOne({
      role: { $regex: /^seller$/i },
      isActive: { $ne: false },
    })
      .select("email clientId companyName")
      .lean();
  }

  return null;
}

async function getSellerEmailByClientId(clientId) {
  const user = await getSellerUserByClientId(clientId);
  return user?.email?.trim() || "";
}

module.exports = {
  getSellerUserByClientId,
  getSellerEmailByClientId,
};
