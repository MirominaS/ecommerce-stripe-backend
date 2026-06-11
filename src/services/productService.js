import Product from "../models/Product.js";
import Media from "../models/Media.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "./mediaService.js";

export const createProductService = async (productData) => {
  if (productData.price < 0) {
    throw new Error("Price cannot be negative");
  }

  if (productData.stock < 0) {
    throw new Error("Stock cannot be negative");
  }

  const existingProduct = await Product.findOne({
    sku: productData.sku,
  });

  if (existingProduct) {
    throw new Error("SKU already exists");
  }

  const product = await Product.create(productData);

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

    price: {
      $gte: minPrice,
      $lte: maxPrice,
    },
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
      price: 1,
    };
  }

  if (sort === "price_desc") {
    sortOption = {
      price: -1,
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

      return {
        ...product.toObject(),
        imageUrl,
        stockStatus:
          product.stock === 0
            ? "Out of Stock"
            : product.stock <= 5
              ? "Low Stock"
              : "In Stock",
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

  let imageUrl = null;

  if (product?.image?.key) {
    imageUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: product.image.key,
      }),
      { expiresIn: 300 },
    );
  }

  return {
    ...product.toObject(),
    imageUrl,
  };
};

export const updateProductService = async (productId, updateData) => {
  if (updateData.sku) {
    const existingProduct = await Product.findOne({
      sku: updateData.sku,
      _id: { $ne: productId },
    });

    if (existingProduct) {
      throw new Error("SKU already exists");
    }
  }

  if (updateData.price !== undefined && updateData.price < 0) {
    throw new Error("Price cannot be negative");
  }

  if (updateData.stock !== undefined && updateData.stock < 0) {
    throw new Error("Stock cannot be negative");
  }

  const updatedProduct = await Product.findOneAndUpdate(
    {
      _id: productId,
      isActive: true,
    },
    updateData,
    {
      new: true,
      runValidators: true,
    },
  ).populate("image");

  if (!updatedProduct) {
    return null;
  }

  let imageUrl = null;

  if (updatedProduct.image?.key) {
    imageUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: updatedProduct.image.key,
      }),
      { expiresIn: 300 },
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
