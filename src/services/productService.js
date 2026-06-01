import Product from "../models/Product.js"

export const createProductService = async (productData) => {
    const product = await Product.create(productData);

    return product
}

export const getProductService = async () => {
    const products = await Product.find()

    return products;
}

export const getProductByIdService = async (productId) => {
    const productById = await Product.findById(productId);

    return productById;
}

export const updateProductService = async (productId, updateData) => {
    const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        updateData,
        {
            new:true,
            runValidators: true,
        }
    )
    return updatedProduct;
}

export const deleteProductService = async (productId) => {
  const deletedProduct = await Product.findByIdAndDelete(productId);

  return deletedProduct;
};