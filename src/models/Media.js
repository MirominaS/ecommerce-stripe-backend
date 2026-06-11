import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },

    url: {
      type: String,
      default: null,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },


    folder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      required: true,
    },

    originalName: {
      type: String,
      required: true,
    },

    mimeType: {
      type: String,
      required: true,
    },

    size: {
      type: Number,
      required: true,
    },

    visibility: {
      type: String,
      enum: ["public", "private", "internal"],
      default: "public",
    }
  },
  {
    timestamps: true,
  },
);

const Media = mongoose.model("Media", mediaSchema);

export default Media;
