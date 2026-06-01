import bcrypt from "bcryptjs";
import User from "../models/User.js";

export const registerUserService = async ({
  name,
  email,
  password,
}) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  return user;
};

export const loginUerService = async (email, password) => {
    const user = await User.findOne({email})

    if (!user) {
        throw new Error("Invalid email or password");
    }

    const isPasswordMatched = await bcrypt.compare(
        password,
        user.password
    );

    if (!isPasswordMatched) {
        throw new Error("Invalid email or password");
    }

    return user;
}