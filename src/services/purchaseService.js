import Purchase from "../models/Purchases.js";
import Inventory from "../models/Inventory.js";
import Product from "../models/Product.js";
import ProductVariant from "../models/ProductVariant.js";

export const createPurchaseService = async (purchaseData) => {
  const { productId, variantId, quantity, purchasePrice, note } = purchaseData;

  // Validation
  if (!productId) {
    throw new Error("ProductId is required");
  }

  if (!quantity || quantity <= 0) {
    throw new Error("Quantity must be greater than 0");
  }

  if (purchasePrice === undefined || purchasePrice < 0) {
    throw new Error("Purchase price must be 0 or greater");
  }

  // Validate Product
  const product = await Product.findOne({
    _id: productId,
    isActive: true,
  });

  if (!product) {
    throw new Error("Product not found");
  }

  let inventory;

  // Variant Product
  if (product.hasVariants && variantId) {
    if (!variantId) {
      throw new Error("VariantId is required for variant products");
    }

    const variant = await ProductVariant.findOne({
      _id: variantId,
      productId,
      isActive: true,
    });

    if (!variant) {
      throw new Error("Variant not found for this product");
    }

    inventory = await Inventory.findOne({
      variantId,
    });

    if (!inventory) {
      throw new Error("Inventory record not found for variant");
    }
  }

  // Single Product
  else {
    if (variantId) {
      throw new Error("Single products cannot have variantId");
    }

    inventory = await Inventory.findOne({
      productId,
    });

    if (!inventory) {
      throw new Error("Inventory record not found for product");
    }
  }

  // Create Purchase
  const purchase = await Purchase.create({
    productId,
    variantId: variantId || null,
    quantity,
    purchasePrice,
    note,
  });

  // Update Inventory
  inventory.stock += quantity;

  await inventory.save();

  return purchase;
};

export const getPurchasesService = async () => {
  const purchases = await Purchase.find({
    isActive: true,
  })
    .populate("productId")
    .populate("variantId")
    .sort({
      createdAt: -1,
    });

  return purchases;
};

export const getPurchaseByIdService = async (purchaseId) => {
  const purchase = await Purchase.findOne({
    _id: purchaseId,
    isActive: true,
  })
    .populate("productId")
    .populate("variantId");

  return purchase;
};
