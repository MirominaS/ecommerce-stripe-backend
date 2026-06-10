import Folder from "../models/Folder.js";

export const createFolder = async (req, res) => {
  try {
    const { name } = req.body;

    const existing = await Folder.findOne({ name });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Folder already exists",
      });
    }

    const folder = await Folder.create({
      name,
    });

    res.status(201).json({
      success: true,
      folder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getFolders = async (req, res) => {
  try {
    const folders = await Folder.find().sort({
      name: 1,
    });

    res.status(200).json({
      success: true,
      folders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteFolder = async (req, res) => {
  try {
    const { id } = req.params;

    await Folder.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Folder deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
