import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

export const getSummaryService = async () => {
  //totals
  const totalOrders = await Order.countDocuments({
    isActive: true,
  });

  const totalProducts = await Product.countDocuments({
    isActive: true,
  });

  const totalUsers = await User.countDocuments({
    isActive: true,
  });

  const totalPayments = await Payment.countDocuments({
    paymentStatus: "paid",
  });

  //revenue
  const revenueResult = await Payment.aggregate([
    {
      $match: {
        paymentStatus: "paid",
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: {
          $sum: "$amount",
        },
      },
    },
  ]);

  const totalRevenue = revenueResult[0]?.totalRevenue || 0;

  //order statuses
  const processingOrders = await Order.countDocuments({
    orderStatus: "processing",
  });

  const shippedOrders = await Order.countDocuments({
    orderStatus: "shipped",
  });

  const deliveredOrders = await Order.countDocuments({
    orderStatus: "delivered",
  });

  const cancelledOrders = await Order.countDocuments({
    orderStatus: "cancelled",
  });

  return {
    totalOrders,
    totalProducts,
    totalUsers,
    totalPayments,
    totalRevenue,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
  };
};

export const getAnalyticsService = async () => {
  //daily
  const dailyAnalytics = await Order.aggregate([
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt",
          },
        },
        orders: {
          $sum: 1,
        },
        revenue: {
          $sum: "$totalPrice",
        },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
  ]);

  // monthly analytics
  const monthlyAnalytics = await Order.aggregate([
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m",
            date: "$createdAt",
          },
        },
        orders: {
          $sum: 1,
        },
        revenue: {
          $sum: "$totalPrice",
        },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
  ]);

  return {
    dailyAnalytics,
    monthlyAnalytics,
  };
};
