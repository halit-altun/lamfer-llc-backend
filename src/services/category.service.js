const Category = require("../models/category.model");
const { AMAZON_MAIN_CATEGORIES } = require("../data/amazon-main-categories");

async function seedCategoriesIfEmpty() {
  const count = await Category.countDocuments();
  if (count > 0) {
    return { seeded: false, count };
  }

  const documents = AMAZON_MAIN_CATEGORIES.map((category, index) => ({
    slug: category.slug,
    amazonBrowseNodeId: category.amazonBrowseNodeId,
    name: category.name,
    sortOrder: index + 1,
    isActive: true,
  }));

  await Category.insertMany(documents);
  return { seeded: true, count: documents.length };
}

function buildSearchFilter(search) {
  if (!search || !search.trim()) {
    return { isActive: true };
  }

  const term = search.trim();
  const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

  return {
    isActive: true,
    $or: [{ "name.en": regex }, { "name.tr": regex }, { slug: regex }],
  };
}

async function getCategories({ search, page = 1, limit = 10 } = {}) {
  await seedCategoriesIfEmpty();

  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
  const filter = buildSearchFilter(search);
  const skip = (safePage - 1) * safeLimit;

  const [categories, total] = await Promise.all([
    Category.find(filter)
      .sort({ sortOrder: 1, "name.en": 1 })
      .skip(skip)
      .limit(safeLimit)
      .select("_id slug name amazonBrowseNodeId sortOrder")
      .lean(),
    Category.countDocuments(filter),
  ]);

  return {
    categories,
    pagination: {
      total,
      page: safePage,
      limit: safeLimit,
      pages: Math.ceil(total / safeLimit) || 1,
    },
  };
}

async function getCategoryById(id) {
  await seedCategoriesIfEmpty();
  return Category.findOne({ _id: id, isActive: true })
    .select("_id slug name amazonBrowseNodeId sortOrder")
    .lean();
}

module.exports = {
  seedCategoriesIfEmpty,
  getCategories,
  getCategoryById,
};
