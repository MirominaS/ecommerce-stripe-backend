import Media from "../models/Media.js";
import { deleteFromR2, uploadToR2 } from "../services/mediaService.js";
import Folder from "../models/Folder.js";

export const getMedia = async (req, res) => {
  try {
    const media = await Media.find().populate("folder").sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      media,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
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

    const folderDoc = await Folder.findById(folder);

    if (!folderDoc) {
      return res.status(404).json({
        success: false,
        message: "Folder not found",
      });
    }

    const folderPath = folderDoc.name.trim().replace(/\s+/g, "-").toLowerCase();

    const result = await uploadToR2(req.file, folderPath);

    const media = await Media.create({
      url: result.url,
      key: result.key,
      folder,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
    });

    const populatedMedia = await Media.findById(media._id).populate("folder");

    res.status(200).json({
      success: true,
      image: populatedMedia,
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
    const { id } = req.params;

    const media = await Media.findById(id);

    if (!media) {
      return res.status(400).json({
        success: false,
        message: "Image not found",
      });
    }

    await deleteFromR2(media.key);

    await media.deleteOne();

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
