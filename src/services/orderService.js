import Order from "../models/Order.js";
import Product from "../models/Product.js";

export const createOrderService = async (userId, items) => {
  if (!items || items.length === 0) {
    throw new Error("Cart is empty");
  }
  //check stock and reduce stock
  for (const item of items) {
    const product = await Product.findById(item._id);

    if (!product) {
      throw new Error(`${item.title} not found`);
    }

    if (!product.isActive) {
      throw new Error(`${product.title} is unavailable`);
    }

    if (product.stock < item.quantity) {
      throw new Error(`${product.title} only has ${product.stock} item left`);
    }

    product.stock -= item.quantity;
    await product.save();
  }

  //prepare order items
  const orderItems = items.map((item) => ({
    product: item._id,
    title: item.title,
    price: item.price,
    quantity: item.quantity,
  }));

  //total
  const totalPrice = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  //create order
  const order = await Order.create({
    user: userId,
    orderItems,
    totalPrice,
  });

  console.log("CREATED ORDER:", order);
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
      await Product.findByIdAndUpdate(item.product, {
        $inc: {
          stock: item.quantity,
        },
      });
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
