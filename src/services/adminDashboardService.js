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

  const lowStockProducts = await Product.countDocuments({
    isActive: true,
    stock: { $lte: 5 },
  });

  const lowStockItems = await Product.find({
    isActive: true,
    stock: { $lte: 5 },
  })
    .select("title stock")
    .sort({ stock: 1 })
    .limit(10);

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

  const totalRevenue = Number(revenueResult[0]?.totalRevenue || 0).toFixed(2);

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
    lowStockProducts,
    lowStockItems,
  };
};

export const getAnalyticsService = async ({ filter, fromDate, toDate }) => {
  const buildDateFilter = () => {
    const filterObj = {};
    const now = new Date();

    let startDate;
    let endDate;

    switch (filter) {
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);
        break;

      case "week":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay());
        startDate.setHours(0, 0, 0, 0);

        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 7);
        break;

      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);

        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;

      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);

        endDate = new Date(now.getFullYear() + 1, 0, 1);
        break;

      case "lastyear":
        startDate = new Date(now.getFullYear() - 1, 0, 1);

        endDate = new Date(now.getFullYear(), 0, 1);
        break;

      case "custom":
        if (fromDate && toDate) {
          startDate = new Date(fromDate);

          endDate = new Date(toDate);
          endDate.setDate(endDate.getDate() + 1);
        }
        break;

      default:
        return {};
    }

    if (startDate && endDate) {
      filterObj.createdAt = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    return filterObj;
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
