/**
 * Amazon ana (üst düzey) kategorileri — alt kategoriler dahil değil.
 * name.en: Amazon.com resmi departman adları
 * name.tr: Amazon.com.tr karşılıkları
 */
const AMAZON_MAIN_CATEGORIES = [
  { slug: "amazon-devices-accessories", amazonBrowseNodeId: "16333372011", name: { en: "Amazon Devices & Accessories", tr: "Amazon Cihazları ve Aksesuarları" } },
  { slug: "appliances", amazonBrowseNodeId: "2619525011", name: { en: "Appliances", tr: "Beyaz Eşya" } },
  { slug: "arts-crafts-sewing", amazonBrowseNodeId: "2617941011", name: { en: "Arts, Crafts & Sewing", tr: "Sanat, El Sanatları ve Dikiş" } },
  { slug: "automotive", amazonBrowseNodeId: "15684181", name: { en: "Automotive", tr: "Otomotiv" } },
  { slug: "baby", amazonBrowseNodeId: "165796011", name: { en: "Baby", tr: "Bebek" } },
  { slug: "beauty-personal-care", amazonBrowseNodeId: "3760911", name: { en: "Beauty & Personal Care", tr: "Güzellik ve Kişisel Bakım" } },
  { slug: "books", amazonBrowseNodeId: "283155", name: { en: "Books", tr: "Kitaplar" } },
  { slug: "cds-vinyl", amazonBrowseNodeId: "5174", name: { en: "CDs & Vinyl", tr: "CD ve Plaklar" } },
  { slug: "cell-phones-accessories", amazonBrowseNodeId: "2335752011", name: { en: "Cell Phones & Accessories", tr: "Cep Telefonu ve Aksesuarları" } },
  { slug: "clothing-shoes-jewelry", amazonBrowseNodeId: "7141123011", name: { en: "Clothing, Shoes & Jewelry", tr: "Moda" } },
  { slug: "collectibles-fine-art", amazonBrowseNodeId: "4991425011", name: { en: "Collectibles & Fine Art", tr: "Koleksiyon ve Sanat Eserleri" } },
  { slug: "computers", amazonBrowseNodeId: "541966", name: { en: "Computers", tr: "Bilgisayarlar" } },
  { slug: "electronics", amazonBrowseNodeId: "172282", name: { en: "Electronics", tr: "Elektronik" } },
  { slug: "grocery-gourmet-food", amazonBrowseNodeId: "16310101", name: { en: "Grocery & Gourmet Food", tr: "Gıda ve İçecek" } },
  { slug: "handmade", amazonBrowseNodeId: "11260432011", name: { en: "Handmade", tr: "El Yapımı" } },
  { slug: "health-household", amazonBrowseNodeId: "3760901", name: { en: "Health & Household", tr: "Sağlık ve Bakım" } },
  { slug: "home-kitchen", amazonBrowseNodeId: "1055398", name: { en: "Home & Kitchen", tr: "Ev ve Mutfak" } },
  { slug: "industrial-scientific", amazonBrowseNodeId: "16310091", name: { en: "Industrial & Scientific", tr: "Endüstriyel ve Bilimsel" } },
  { slug: "luggage-travel-gear", amazonBrowseNodeId: "15743161", name: { en: "Luggage & Travel Gear", tr: "Valiz, Bavul ve Seyahat Çantaları" } },
  { slug: "movies-tv", amazonBrowseNodeId: "2625373011", name: { en: "Movies & TV", tr: "Film ve TV" } },
  { slug: "musical-instruments", amazonBrowseNodeId: "11091801", name: { en: "Musical Instruments", tr: "Müzik Enstrümanları ve DJ" } },
  { slug: "office-products", amazonBrowseNodeId: "1064954", name: { en: "Office Products", tr: "Ofis Ürünleri" } },
  { slug: "patio-lawn-garden", amazonBrowseNodeId: "2972638011", name: { en: "Patio, Lawn & Garden", tr: "Bahçe" } },
  { slug: "pet-supplies", amazonBrowseNodeId: "2619533011", name: { en: "Pet Supplies", tr: "Evcil Hayvan Ürünleri" } },
  { slug: "software", amazonBrowseNodeId: "229534", name: { en: "Software", tr: "Yazılım" } },
  { slug: "sports-outdoors", amazonBrowseNodeId: "3375251", name: { en: "Sports & Outdoors", tr: "Spor ve Outdoor" } },
  { slug: "tools-home-improvement", amazonBrowseNodeId: "228013", name: { en: "Tools & Home Improvement", tr: "El Aletleri ve Ev Geliştirme" } },
  { slug: "toys-games", amazonBrowseNodeId: "165793011", name: { en: "Toys & Games", tr: "Oyuncaklar ve Oyunlar" } },
  { slug: "video-games", amazonBrowseNodeId: "468642", name: { en: "Video Games", tr: "Video Oyunu ve Konsol" } },
];

module.exports = { AMAZON_MAIN_CATEGORIES };
