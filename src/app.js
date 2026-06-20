const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const productRoutes = require("./routes/product.routes");
const categoryRoutes = require("./routes/category.routes");

const app = express();

app.use(express.json());
app.use(cors());

app.get("/health", (_req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = { 0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting" };
  res.json({
    ok: true,
    db: states[dbState] ?? "unknown",
  });
});

app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);

  if (err.name === "ValidationError") {
    const details = Object.values(err.errors || {}).map((item) => item.message);
    return res.status(400).json({
      ok: false,
      message: "Doğrulama hatası",
      details,
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      ok: false,
      message: "Bu kayıt zaten mevcut (duplicate key).",
    });
  }

  res.status(500).json({ ok: false, message: "Sunucu hatası" });
});

module.exports = app;
