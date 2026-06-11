import Media from "../models/Media.js";
import { deleteFromR2, uploadToR2, s3 } from "../services/mediaService.js";
import Folder from "../models/Folder.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";

export const getMedia = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "admin") {
      query = {};
    } else {
      query = {
        $or: [
          { visibility: "public" },
          {
            visibility: "private",
            uploadedBy: req.user._id,
          },
        ],
      };
    }

    const media = await Media.find(query)
      .populate("folder")
      .sort({ createdAt: -1 });

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

    const { folder, visibility = "public" } = req.body;

    const allowed = ["public", "private", "internal"];

    if (!allowed.includes(visibility)) {
      return res.status(400).json({
        success: false,
        message: "Invalid visibility value",
      });
    }

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
      key: result.key,
      visibility,
      uploadedBy: req.user._id,
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

export const getMediaAccessUrl = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);

    if (!media) {
      return res.status(404).json({
        success: false,
        message: "Media not found",
      });
    }

    // public
    if (media.visibility === "public") {
      const url = await getSignedUrl(
        s3,
        new GetObjectCommand({
          Bucket: process.env.R2_BUCKET,
          Key: media.key,
        }),
        { expiresIn: 3000 },
      );

      return res.json({
        success: true,
        url,
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Login required",
      });
    }

    // internal
    if (media.visibility === "internal" && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // private
    if (
      media.visibility === "private" &&
      media.uploadedBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const url = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: media.key,
      }),
      { expiresIn: 300 },
    );

    res.json({
      success: true,
      url,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
