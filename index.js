require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./src/app");

const port = 3001;
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("MONGODB_URI .env dosyasında tanımlı değil.");
  process.exit(1);
}

async function main() {
  await mongoose.connect(uri);
  console.log("MongoDB bağlantısı kuruldu.");

  app.listen(port, () => {
    console.log(`Sunucu http://localhost:${port} adresinde çalışıyor.`);
  });
}

main().catch((err) => {
  console.error("Başlatma hatası:", err.message);
  process.exit(1);
});
