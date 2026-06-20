require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../src/models/product.model");
const Counter = require("../src/models/counter.model");

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("MONGODB_URI .env dosyasında tanımlı değil.");
  process.exit(1);
}

async function main() {
  await mongoose.connect(uri);

  const products = await Product.find({ publicId: { $exists: false } }).sort({ createdAt: 1 });
  let counter = await Counter.findById("productPublicId");
  let seq = counter?.seq ?? 0;

  for (const product of products) {
    seq += 1;
    await Product.updateOne(
      { _id: product._id },
      {
        $set: {
          publicId: seq,
          brandSlug: product.brandSlug || process.env.DEFAULT_BRAND_SLUG || "lamfer",
        },
      }
    );
    console.log(`Assigned publicId ${seq} → ${product.productName}`);
  }

  await Counter.findByIdAndUpdate(
    "productPublicId",
    { seq },
    { upsert: true, setDefaultsOnInsert: true }
  );

  console.log(`Migration complete. Counter at ${seq}.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Migration hatası:", err.message);
  process.exit(1);
});
