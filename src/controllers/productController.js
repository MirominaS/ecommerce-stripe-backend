import {
  createProductService,
  deleteProductService,
  getProductByIdService,
  getProductService,
  importProductService,
  updateProductService,
} from "../services/productService.js";

export const createProduct = async (req, res) => {
  try {
    const product = await createProductService(req.body);

    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getProducts = async (req, res) => {
  try {
    // pagination
    const pageRaw = Number(req.query.page ?? 1);
    const limitRaw = Number(req.query.limit ?? 10);

    const page =
      Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;

    const limit =
      Number.isFinite(limitRaw) && limitRaw > 0 ? Math.floor(limitRaw) : 10;

    const skip = (page - 1) * limit;

    // filters
    const category = req.query.category || "";
    const search = req.query.search || "";
    const sort = req.query.sort || "";
    const minPrice = Number(req.query.minPrice) || 0;
    const maxPrice = Number(req.query.maxPrice) || Infinity;

    const data = await getProductService({
      page,
      limit,
      skip,
      category,
      search,
      sort,
      minPrice,
      maxPrice,
    });

    res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await getProductByIdService(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const updatedProduct = await updateProductService(req.params.id, req.body);

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    res.status(200).json({
      success: true,
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await deleteProductService(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const importProducts = async (req, res) => {
  try {
    const { products } = req.body;

    const result = await importProductService(products);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
