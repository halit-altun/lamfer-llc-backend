const { getCategories, getCategoryById } = require("../services/category.service");

async function getCategoriesHandler(req, res, next) {
  try {
    const { search, page, limit } = req.query;
    const result = await getCategories({ search, page, limit });
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

async function getCategoryByIdHandler(req, res, next) {
  try {
    const category = await getCategoryById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Kategori bulunamadı." });
    }

    return res.json(category);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getCategoriesHandler,
  getCategoryByIdHandler,
};
