import Order from '../models/Order.js'

export const createOrderService = async (userId,items,sessionId) => {
    if(!items || items.length === 0) {
        throw new Error("Cart is empty")
    }

    //prepare order items
    const orderItems = items.map((item) => ({
        product: item._id,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
    }))

    //total
    const totalPrice = items.reduce(
        (total,item) => total + item.price* item.quantity,
        0
    )
    //create order
    const order = await Order.create({
        user: userId,
        orderItems,
        totalPrice,
        paymentSessionId: sessionId,
        paymentStatus: "paid",
    })
    return order
}

export const getMyOrderService = async (userId) => {
    const orders = await Order.find({
        user: userId,
    }).sort({
        createdAt: -1,
    })

    return orders;
}

export const getAllOrdersService = async () => {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({
        createdAt: -1,
      });

    return orders;
  };

  export const updateOrderStatusService = async (orderId, status) => {
    const order = await Order.findById(orderId);

    if(!order){
        throw new Error("Order not found")
    }

    order.orderStatus = status;
    await order.save()
    return order;
  }