require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../src/models/product.model");
const User = require("../src/models/user.model");

const uri = process.env.MONGODB_URI;
const LEGACY_SELLER_ID = "seller-001";

if (!uri) {
  console.error("MONGODB_URI .env dosyasında tanımlı değil.");
  process.exit(1);
}

async function main() {
  await mongoose.connect(uri);

  const seller = await User.findOne({ role: "seller", isActive: { $ne: false } })
    .select("clientId email")
    .lean();

  if (!seller?.clientId) {
    console.error("Aktif satıcı kullanıcısı (users) bulunamadı.");
    process.exit(1);
  }

  const result = await Product.updateMany(
    { sellerId: LEGACY_SELLER_ID },
    { $set: { sellerId: seller.clientId } }
  );

  console.log(
    `Ürün sellerId güncellendi: ${LEGACY_SELLER_ID} → ${seller.clientId} (${seller.email}) — ${result.modifiedCount} kayıt`
  );

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Migration hatası:", err.message);
  process.exit(1);
});
