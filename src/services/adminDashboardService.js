import { populate } from "dotenv";
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

export const getAnalyticsService = async ({ date, month }) => {
  // Reusable date filter builder
  const buildDateFilter = () => {
    const filter = {};

    // Daily filter
    if (date) {
      const startDate = new Date(date);

      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);

      filter.createdAt = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    // Monthly filter
    if (month) {
      const [year, monthValue] = month.split("-");

      const startDate = new Date(year, monthValue - 1, 1);

      const endDate = new Date(year, monthValue, 1);

      filter.createdAt = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    return filter;
  };

  const orderMatchStage = buildDateFilter();
  const paymentMatchStage = buildDateFilter();

  // DAILY ANALYTICS
  const dailyAnalytics = await Order.aggregate([
    {
      $match: orderMatchStage,
    },
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

  // MONTHLY ANALYTICS
  const monthlyAnalytics = await Order.aggregate([
    {
      $match: orderMatchStage,
    },
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

  // ORDER STATUS PIE CHART
  const orderStatusAnalytics = await Order.aggregate([
    {
      $match: orderMatchStage,
    },
    {
      $group: {
        _id: "$orderStatus",
        value: {
          $sum: 1,
        },
      },
    },
  ]);

  // REVENUE BY CATEGORY
  const revenueByCategory = await Order.aggregate([
    {
      $match: orderMatchStage,
    },
    {
      $unwind: "$orderItems",
    },
    {
      $lookup: {
        from: "products",
        localField: "orderItems.product",
        foreignField: "_id",
        as: "product",
      },
    },
    {
      $unwind: "$product",
    },
    {
      $group: {
        _id: "$product.category",
        revenue: {
          $sum: {
            $multiply: ["$orderItems.price", "$orderItems.quantity"],
          },
        },
      },
    },
    {
      $sort: {
        revenue: -1,
      },
    },
  ]);

  // TOP SELLING PRODUCTS
  const topSellingProducts = await Order.aggregate([
    {
      $match: orderMatchStage,
    },
    {
      $unwind: "$orderItems",
    },
    {
      $group: {
        _id: "$orderItems.product",

        title: {
          $first: "$orderItems.title",
        },

        totalSold: {
          $sum: "$orderItems.quantity",
        },

        revenue: {
          $sum: {
            $multiply: ["$orderItems.price", "$orderItems.quantity"],
          },
        },
      },
    },
    {
      $sort: {
        revenue: -1,
      },
    },
    {
      $limit: 10,
    },
  ]);

  // PAYMENT STATUS DISTRIBUTION
  const paymentStatusAnalytics = await Payment.aggregate([
    {
      $match: paymentMatchStage,
    },
    {
      $group: {
        _id: "$paymentStatus",
        count: {
          $sum: 1,
        },
      },
    },
  ]);

  return {
    dailyAnalytics,
    monthlyAnalytics,
    orderStatusAnalytics,
    revenueByCategory,
    topSellingProducts,
    paymentStatusAnalytics,
  };
};
