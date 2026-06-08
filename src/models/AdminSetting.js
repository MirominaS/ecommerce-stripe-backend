import mongoose from "mongoose";

const settingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    value: {
      type: String,
      default: "",
    },  
  },
  {
    timestamps: true,
  },
);

const AdminSetting = mongoose.model("AdminSetting", settingSchema);

export default AdminSetting;
