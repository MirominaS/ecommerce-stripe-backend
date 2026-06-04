import bcrypt from "bcryptjs";
import User from "../models/User.js";

export const registerUserService = async ({ name, email, password }) => {
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
  const user = await User.findOne({
    email,
    // isActive: true,
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  if (!user.isActive) {
    throw new Error("User account disabled");
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    throw new Error("Invalid email or password");
  }

  return user;
};

export const getAllUsersService = async ({ page, limit, skip, search }) => {
  const query = {};

  if (search) {
    query.$or = [
      {
        name: {
          $regex: search,
          $options: "i",
        },
      },
      {
        email: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  const users = await User.find(query)
    .select("-password")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const totalUsers = await User.countDocuments(query);

  return {
    users,
    pagination: {
      page,
      limit,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
    },
  };
};

export const getUserByIdService = async (userId) => {
  return await User.findById(userId).select("-password");
};

export const updateUserService = async (userId, updateData) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  if (updateData.role !== undefined) {
    user.role = updateData.role;
  }

  if (updateData.isActive !== undefined) {
    user.isActive = updateData.isActive;
  }

  await user.save();

  return user;
};

export const deleteUserService = async (userId, currentAdminId) => {
  if (userId.toString() === currentAdminId.toString()) {
    throw new Error("You cannot deactivate your own account");
  }

  return await User.findByIdAndUpdate(
    userId,
    {
      isActive: false,
    },
    {
      new: true,
    },
  );
};
