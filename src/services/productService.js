import Product from "../models/Product.js"

export const createProductService = async (productData) => {
    const product = await Product.create(productData);

    return product
}

export const getProductService = async () => {
    const products = await Product.find({
        isActive: true,
    })

    return products;
}

export const getProductByIdService = async (productId) => {
    const productById = await Product.findOne({
        _id: productId,
        isActive: true,
    });

    return productById;
}

export const updateProductService = async (productId, updateData) => {
    const updatedProduct = await Product.findOneAndUpdate(
        {
            _id: productId,
            isActive: true,
        },
        updateData,
        {
            new:true,
            runValidators: true,
        }
    )
    return updatedProduct;
}

export const deleteProductService = async (productId) => {
  const deletedProduct = await Product.findByIdAndUpdate(
    productId,
    {
        isActive: false,
    },
    {
        new: true,
    }
);

  return deletedProduct;
};