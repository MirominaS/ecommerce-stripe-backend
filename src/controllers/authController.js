import { loginUerService, registerUserService } from "../services/authService.js"
import generateToken from "../utils/generateToken.js";

export const registerUser = async (req, res) => {
    try {
        const user = await registerUserService(req.body);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

export const loginUser = async (req,res) => {
    try {
        const {email, password} =req.body;

        const user = await loginUerService(email, password);

        const token = generateToken(user._id)

        res.status(200).json({
            success: true,
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}