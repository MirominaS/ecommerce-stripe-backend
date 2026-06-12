import Product from "../models/Product.js";
import Media from "../models/Media.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "./mediaService.js";
import Inventory from "../models/Inventory.js";
import ProductVariant from "../models/ProductVariant.js";

export const createProductService = async (productData) => {
  // Variant Product Validation
  if (productData.hasVariants) {
    if (productData.sku) {
      throw new Error("Variant products cannot have SKU");
    }

    if (productData.sellingPrice !== undefined) {
      throw new Error("Variant products cannot have selling price");
    }
  }

  // Single Product Validation
  if (!productData.hasVariants) {
    if (!productData.sku) {
      throw new Error("SKU is required");
    }

    if (productData.sellingPrice === undefined) {
      throw new Error("Selling price is required");
    }

    if (productData.sellingPrice < 0) {
      throw new Error("Selling price cannot be negative");
    }

    const existingProduct = await Product.findOne({
      sku: productData.sku,
    });

    if (existingProduct) {
      throw new Error("SKU already exists");
    }
  }

  // Create Product
  const product = await Product.create(productData);

  // Create inventory
  await Inventory.create({
    productId: product._id,
    stock: 0,
  });

  return product;
};

export const getProductService = async ({
  page,
  limit,
  skip,
  category,
  search,
  sort,
  minPrice,
  maxPrice,
}) => {
  // base query
  const query = {
    isActive: true,
  };

  // category filter
  if (category) {
    query.category = {
      $regex: category,
      $options: "i",
    };
  }

  // search filter
  if (search) {
    query.title = {
      $regex: search,
      $options: "i",
    };
  }

  // sorting
  let sortOption = {
    createdAt: -1,
  };

  if (sort === "price_asc") {
    sortOption = {
      sellingPrice: 1,
    };
  }

  if (sort === "price_desc") {
    sortOption = {
      sellingPrice: -1,
    };
  }

  if (sort === "newest") {
    sortOption = {
      createdAt: -1,
    };
  }

  // products
  const products = await Product.find(query)
    .populate("image")
    .sort(sortOption)
    .skip(skip)
    .limit(limit);

  const productsWithStatus = await Promise.all(
  products.map(async (product) => {
    let imageUrl = null;

    if (product.image?.key) {
      imageUrl = await getSignedUrl(
        s3,
        new GetObjectCommand({
          Bucket: process.env.R2_BUCKET,
          Key: product.image.key,
        }),
        { expiresIn: 300 },
      );
    }

    let variants = [];

    if (product.hasVariants) {
      const productVariants = await ProductVariant.find({
        productId: product._id,
        isActive: true,
      });

      const variantIds = productVariants.map(v => v._id);

      const inventories = await Inventory.find({
        variantId: { $in: variantIds },
      });

      const inventoryMap = new Map();

      inventories.forEach((inventory) => {
        inventoryMap.set(
          inventory.variantId.toString(),
          inventory.stock
        );
      });

      variants = productVariants.map((variant) => ({
        ...variant.toObject(),
        stock: inventoryMap.get(
          variant._id.toString()
        ) || 0,
      }));
    }

    return {
      ...product.toObject(),
      imageUrl,
      variants,
    };
  }),
);


  // total count
  const totalProducts = await Product.countDocuments(query);

  const totalPages = Math.ceil(totalProducts / limit);

  return {
    products: productsWithStatus,
    pagination: {
      page,
      limit,
      totalProducts,
      totalPages,
    },
  };
};

export const getProductByIdService = async (productId) => {
  const product = await Product.findOne({
    _id: productId,
    isActive: true,
  }).populate("image");

  if (!product) {
    return null;
  }

  let imageUrl = null;

  if (product.image?.key) {
    imageUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: product.image.key,
      }),
      {
        expiresIn: 300,
      },
    );
  }

  // Single product
  if (!product.hasVariants) {
    const inventory = await Inventory.findOne({
      productId: product._id,
    });

    return {
      ...product.toObject(),
      imageUrl,

      inventory: {
        stock: inventory?.stock || 0,
      },
    };
  }

  // has variants
  const variants = await ProductVariant.find({
    productId: product._id,
    isActive: true,
  });

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

  const variantsWithInventory = variants.map((variant) => {
    const inventory = inventoryMap.get(variant._id.toString());

    return {
      ...variant.toObject(),
      stock: inventory?.stock || 0,
    };
  });

  return {
    ...product.toObject(),
    imageUrl,
    variants: variantsWithInventory,
  };
};

export const updateProductService = async (productId, updateData) => {
  const product = await Product.findById(productId);

  if (!product || !product.isActive) {
    return null;
  }

  // Simple Product Validation
  if (!product.hasVariants) {
    if (updateData.sellingPrice !== undefined && updateData.sellingPrice < 0) {
      throw new Error("Selling price cannot be negative");
    }

    if (updateData.sku) {
      const existingProduct = await Product.findOne({
        sku: updateData.sku,
        _id: { $ne: productId },
      });

      if (existingProduct) {
        throw new Error("SKU already exists");
      }
    }
  }

  // Variant Product Validation
  if (product.hasVariants) {
    if (updateData.sku) {
      throw new Error("Variant products cannot have SKU");
    }

    if (updateData.sellingPrice !== undefined) {
      throw new Error("Variant products cannot have selling price");
    }
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    updateData,
    {
      new: true,
      runValidators: true,
    },
  ).populate("image");

  let imageUrl = null;

  if (updatedProduct?.image?.key) {
    imageUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: updatedProduct.image.key,
      }),
      {
        expiresIn: 300,
      },
    );
  }

  return {
    ...updatedProduct.toObject(),
    imageUrl,
  };
};

export const deleteProductService = async (productId) => {
  const deletedProduct = await Product.findByIdAndUpdate(
    productId,
    {
      isActive: false,
    },
    {
      new: true,
    },
  );

  return deletedProduct;
};

export const importProductService = async (products) => {
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const product of products) {
    const existingProduct = await Product.findOne({
      sku: product.sku,
    });

    if (existingProduct) {
      const hasChanges =
        existingProduct.title !== product.title ||
        existingProduct.description !== product.description ||
        existingProduct.price !== Number(product.price) ||
        existingProduct.category !== product.category ||
        existingProduct.stock !== Number(product.stock);

      if (hasChanges) {
        await Product.findOneAndUpdate(
          { sku: product.sku },
          {
            title: product.title,
            description: product.description,
            price: product.price,
            category: product.category,
            stock: product.stock,
          },
        );

        updated++;
      } else {
        skipped++;
      }
    } else {
      await Product.create(product);
      created++;
    }
  }

  return {
    created,
    updated,
    skipped,
  };
};
