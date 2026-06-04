import {
  getAnalyticsService,
  getSummaryService,
} from "../services/adminDashboardService.js";
import Payment from "../models/Payment.js";

export const getSummary = async (req, res) => {
  try {
    const summary = await getSummaryService();

    res.status(200).json({
      success: true,
      summary,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const { filter = "today", fromDate, toDate } = req.query;

    const analytics = await getAnalyticsService({ filter, fromDate, toDate });

    res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllPayments = async (req, res) => {
  try {
    // pagination
    const pageRaw = Number(req.query.page ?? 1);
    const limitRaw = Number(req.query.limit ?? 10);

    const page =
      Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;

    const limit =
      Number.isFinite(limitRaw) && limitRaw > 0 ? Math.floor(limitRaw) : 10;

    const skip = (page - 1) * limit;

    // filters
    const status = req.query.status || "";
    const search = req.query.search || "";

    // query
    const query = {};

    if (status) {
      query.paymentStatus = status;
    }

    // payments query
    let paymentsQuery = Payment.find(query)
      .populate("user", "name email")
      .populate("order")
      .sort({
        createdAt: -1,
      });

    // search
    if (search) {
      paymentsQuery = paymentsQuery.populate({
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

    // execute
    const payments = await paymentsQuery.skip(skip).limit(limit);

    // remove unmatched users
    const filteredPayments = payments.filter(
      (payment) => payment.user !== null,
    );

    // total
    const totalPayments = await Payment.countDocuments(query);

    const totalPages = Math.ceil(totalPayments / limit);

    res.status(200).json({
      success: true,
      payments: filteredPayments,

      pagination: {
        page,
        limit,
        totalPayments,
        totalPages,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
