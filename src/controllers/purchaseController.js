import { createPurchaseService, getPurchasesService, getPurchaseByIdService} from "../services/purchaseService.js";

export const createPurchase = async (req, res) => {
  try {
    const purchase = await createPurchaseService(req.body);

    res.status(201).json({
      success: true,
      purchase,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPurchases = async (req, res) => {
  try {
    const purchases =
      await getPurchasesService();

    res.status(200).json({
      success: true,
      purchases,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPurchaseById =
  async (req, res) => {
    try {
      const purchase =
        await getPurchaseByIdService(
          req.params.id,
        );

      if (!purchase) {
        return res.status(404).json({
          success: false,
          message:
            "Purchase not found",
        });
      }

      res.status(200).json({
        success: true,
        purchase,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };