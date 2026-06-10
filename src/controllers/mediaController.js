import { deleteFromR2, uploadToR2 } from "../services/mediaService.js";

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const { folder } = req.body;

    if (!folder) {
      return res.status(400).json({
        success: false,
        message: "Folder is required",
      });
    }

    const result = await uploadToR2(req.file, folder);

    res.status(200).json({
      success: true,
      image: result.url,
      key: result.key,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteImage = async (req, res) => {
  try {
    const { key } = req.body;

    if (!key) {
      return res.status(400).json({
        success: false,
        message: "Image key is required",
      });
    }

    await deleteFromR2(key);

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
