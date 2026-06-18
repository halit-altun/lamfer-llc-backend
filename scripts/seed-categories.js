require("dotenv").config();
const mongoose = require("mongoose");
const { seedCategoriesIfEmpty } = require("../src/services/category.service");

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("MONGODB_URI .env dosyasında tanımlı değil.");
  process.exit(1);
}

async function main() {
  await mongoose.connect(uri);
  const result = await seedCategoriesIfEmpty();
  console.log(
    result.seeded
      ? `${result.count} Amazon ana kategorisi veritabanına eklendi.`
      : `Kategoriler zaten mevcut (${result.count} kayıt).`
  );
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Seed hatası:", err.message);
  process.exit(1);
});
