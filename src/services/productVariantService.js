import Product from "../models/Product.js";
import Inventory from "../models/Inventory.js";
import ProductVariant from "../models/ProductVariant.js";
import Media from "../models/Media.js";

export const createVariantService = async (productId, variantData) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw new Error("Product not found");
  }

  if (!product.hasVariants) {
    throw new Error("This product does not support variants");
  }

  const existingVariant = await ProductVariant.findOne({
    sku: variantData.sku,
  });

  if (existingVariant) {
    throw new Error("SKU already exists");
  }

  const variant = await ProductVariant.create({
    productId,
    sku: variantData.sku,
    sellingPrice: variantData.sellingPrice,
    attributes: variantData.attributes,
    image: variantData.image || [],
  });

  await Inventory.create({
     productId: productId,
    variantId: variant._id,
    stock: 0,
  });

  return variant;
};

export const getVariantsByProductService = async (productId) => {
  const variants = await ProductVariant.find({
    productId,
    isActive: true,
  }).populate("image");

  const variantIds = variants.map((variant) => variant._id);

  const inventories = await Inventory.find({
    variantId: {
      $in: variantIds,
    },
  });

  const inventoryMap = new Map();

  inventories.forEach((inventory) => {
    inventoryMap.set(inventory.variantId.toString(), inventory);
  });

  return variants.map((variant) => {
    const inventory = inventoryMap.get(variant._id.toString());

    return {
      ...variant.toObject(),
      stock: inventory?.stock || 0,
    };
  });
};

export const getVariantByIdService = async (variantId) => {
  const variant = await ProductVariant.findOne({
    _id: variantId,
    isActive: true,
  }).populate("image");

  if (!variant) {
    return null;
  }

  const inventory = await Inventory.findOne({
    variantId,
  });

  return {
    ...variant.toObject(),
    stock: inventory?.stock || 0,
  };
};

export const updateVariantService = async (variantId, updateData) => {
  if (updateData.sku) {
    const existingVariant = await ProductVariant.findOne({
      sku: updateData.sku,
      _id: {
        $ne: variantId,
      },
    });

    if (existingVariant) {
      throw new Error("You cannot update SKU");
    }
  }

  if (updateData.sellingPrice !== undefined && updateData.sellingPrice < 0) {
    throw new Error("Selling price cannot be negative");
  }

  return await ProductVariant.findOneAndUpdate(
    {
      _id: variantId,
      isActive: true,
    },
    updateData,
    {
      returnDocument: "after",
      runValidators: true,
    },
  );
};

export const deleteVariantService = async (variantId) => {
  return await ProductVariant.findByIdAndUpdate(
    variantId,
    {
      isActive: false,
    },
    {
      returnDocument: "after",
    },
  );
};
