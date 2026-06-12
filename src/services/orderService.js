import { Parser } from "json2csv";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import ProductVariant from "../models/ProductVariant.js";
import Inventory from "../models/Inventory.js";
import User from "../models/User.js";
import { customerOrderTemplate } from "../utils/email/templates/orderEmail.js";
import sendEmail from "../utils/email/sendEmail.js";

export const createOrderService = async (userId, items) => {
  if (!items || items.length === 0) {
    throw new Error("Cart is empty");
  }

  const orderItems = [];

  let totalPrice = 0;

  for (const item of items) {
    const product = await Product.findOne({
      _id: item.productId,
      isActive: true,
    });

    if (!product) {
      throw new Error("Product not found");
    }

    let price;
    let sku;
    let inventory;
    let variant = null;

    // Variant Product
    if (product.hasVariants) {
      if (!item.variantId) {
        throw new Error(`${product.title} requires a variant`);
      }

      variant = await ProductVariant.findOne({
        _id: item.variantId,
        productId: product._id,
        isActive: true,
      });

      if (!variant) {
        throw new Error("Variant not found");
      }

      inventory = await Inventory.findOne({
        variantId: variant._id,
      });

      if (!inventory) {
        throw new Error("Inventory not found");
      }

      price = variant.sellingPrice;
      sku = variant.sku;
    }
    // Single Product
    else {
      inventory = await Inventory.findOne({
        productId: product._id,
      });

      if (!inventory) {
        throw new Error("Inventory not found");
      }

      price = product.sellingPrice;
      sku = product.sku;
    }

    // Stock Check
    if (inventory.stock < item.quantity) {
      throw new Error(
        `${product.title} only has ${inventory.stock} item(s) left`,
      );
    }

    // Reduce Stock
    inventory.stock -= item.quantity;

    await inventory.save();

    // Order Item
    orderItems.push({
      product: product._id,
      variant: variant?._id || null,
      title: product.title,
      sku,
      price,
      quantity: item.quantity,
    });

    totalPrice += price * item.quantity;
  }

  // Create Order
  const order = await Order.create({
    user: userId,
    orderItems,
    totalPrice,
  });

  // Send Email
  const user = await User.findById(userId);

  if (user) {
    try {
      await sendEmail({
        to: user.email,
        subject: `Order confirmation - ${order._id}`,
        html: customerOrderTemplate(order),
        text: `Order ${order._id} placed successfully`,
        cc: process.env.ADMIN_EMAIL,
      });
    } catch (error) {
      console.error("Order email failed:", error.message);
    }
  }

  return order;
};

export const getMyOrderService = async (userId) => {
  const orders = await Order.find({
    user: userId,
    isActive: true,
  })
    .populate("user", "name email")
    .populate("payment")
    .sort({
      createdAt: -1,
    });
  console.log("FOUND ORDERS:", orders);

  return orders;
};

export const getAllOrdersService = async ({
  page,
  limit,
  skip,
  status,
  search,
}) => {
  const query = {
    isActive: true,
  };

  if (status) {
    query.orderStatus = status;
  }

  // find orders
  let ordersQuery = Order.find(query)
    .populate("user", "name email")
    .populate("payment")
    .sort({
      createdAt: -1,
    });

  // search by customer name/email
  if (search) {
    ordersQuery = ordersQuery.populate({
      path: "user",
      match: {
        $or: [
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
        ],
      },
    });
  }

  const orders = await ordersQuery.skip(skip).limit(limit);

  // remove unmatched populated users
  const filteredOrders = orders.filter((order) => order.user !== null);

  // total count
  const totalOrders = await Order.countDocuments(query);

  const totalPages = Math.ceil(totalOrders / limit);

  return {
    orders: filteredOrders,
    pagination: {
      page,
      limit,
      totalOrders,
      totalPages,
    },
  };
};

export const updateOrderStatusService = async (orderId, newStatus) => {
  const order = await Order.findOne({
    _id: orderId,
    isActive: true,
  });

  if (!order) {
    throw new Error("Order not found");
  }

  const statusFlow = {
    processing: ["shipped", "cancelled"],
    shipped: ["delivered"],
    delivered: ["refunded"],
    cancelled: [],
    refunded: [],
  };

  const currentStatus = order.orderStatus;

  if (!statusFlow[currentStatus].includes(newStatus)) {
    throw new Error(`Cannot move order from ${currentStatus} to ${newStatus}`);
  }

  if (newStatus === "cancelled") {
    for (const item of order.orderItems) {
      if (item.variant) {
        await Inventory.findOneAndUpdate(
          {
            variantId: item.variant,
          },
          {
            $inc: {
              stock: item.quantity,
            },
          },
        );
      } else {
        await Inventory.findOneAndUpdate(
          {
            productId: item.product,
          },
          {
            $inc: {
              stock: item.quantity,
            },
          },
        );
      }
    }
  }

  order.orderStatus = newStatus;
  await order.save();
  return order;
};

export const deleteOrderService = async (orderId) => {
  const deletedOrder = await Order.findOneAndUpdate(
    {
      _id: orderId,
      isActive: true,
    },
    {
      isActive: false,
    },
    {
      new: true,
    },
  );
  return deletedOrder;
};

export const exportOrdersService = async ({ from, to, status }) => {
  if (!from || !to) {
    throw new Error("From date and To date are required");
  }

  const start = new Date(from);
  const end = new Date(to);

  // Validate date format
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error("Invalid date range");
  }

  // Validate range
  const days = (end - start) / (1000 * 60 * 60 * 24);

  if (days > 90) {
    throw new Error("Maximum export range is 90 days");
  }

  if (start > end) {
    throw new Error("From date cannot be greater than To date");
  }

  const query = {
    isActive: true,
    createdAt: {
      $gte: start,
      $lte: end,
    },
  };

  if (status) {
    query.orderStatus = status;
  }
  const orders = await Order.find(query).populate("user", "name email").lean();

  const rows = orders.map((order) => ({
    orderId: order._id,
    customer: order.user?.name,
    email: order.user?.email,
    totalPrice: order.totalPrice,
    status: order.orderStatus,
    items: order.orderItems.length,
    createdAt: order.createdAt,
  }));

  const parser = new Parser();

  return parser.parse(rows);
};
