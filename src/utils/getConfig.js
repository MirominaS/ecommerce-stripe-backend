import dotenv from "dotenv"
import AdminSetting from "../models/AdminSetting.js";

dotenv.config()

export const getConfig = async (key) => {
    const settings = await AdminSetting.findOne({key});

    if(settings?.value?.trim()){
        return settings.value;
    }

    if(process.env[key]?.trim()){
        return process.env[key];
    }

    throw new Error(
        `Configuration ${key} not found`
    )
    
}