import Product from "../models/Product.js";

export const createProductService = async (productData) => {
  if (productData.price < 0) {
    throw new Error("Price cannot be negative");
  }

  if (productData.stock < 0) {
    throw new Error("Stock cannot be negative");
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
    .sort(sortOption)
    .skip(skip)
    .limit(limit);

  const productsWithStatus = products.map((product) => ({
    ...product.toObject(),
    stockStatus:
      product.stock === 0
        ? "Out of Stock"
        : product.stock <= 5
          ? "Low Stock"
          : "In Stock",
  }));

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
  const productById = await Product.findOne({
    _id: productId,
    isActive: true,
  });

  return productById;
};

export const updateProductService = async (productId, updateData) => {
  // validations
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
  );
  return updatedProduct;
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
