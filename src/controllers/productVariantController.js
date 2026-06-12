import {
  createVariantService,
  getVariantsByProductService,
  getVariantByIdService,
  updateVariantService,
  deleteVariantService,
} from "../services/productVariantService.js";

export const createVariant = async (req, res) => {
  try {
    const variant = await createVariantService(req.params.productId, req.body);

    res.status(201).json({
      success: true,
      variant,
    });
  } catch (error) {
    console.log(error.message)
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getVariantsByProduct = async (req, res) => {
  try {
    const variants = await getVariantsByProductService(req.params.productId);

    res.status(200).json({
      success: true,
      variants,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getVariantById = async (req, res) => {
  try {
    const variant = await getVariantByIdService(req.params.id);

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Variant not found",
      });
    }

    res.status(200).json({
      success: true,
      variant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateVariant = async (req, res) => {
  try {
    const variant = await updateVariantService(req.params.id, req.body);

    res.status(200).json({
      success: true,
      variant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteVariant = async (req, res) => {
  try {
    await deleteVariantService(req.params.id);

    res.status(200).json({
      success: true,
      message: "Variant deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
