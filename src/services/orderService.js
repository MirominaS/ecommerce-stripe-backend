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
    
    console.log("CREATED ORDER:", order);
    return order
}

export const getMyOrderService = async (userId) => {
    const orders = await Order.find({
        user: userId,
        isActive: true,
    }).sort({
        createdAt: -1,
    })
    console.log("FOUND ORDERS:", orders);

    return orders;
}

export const getAllOrdersService = async () => {
    const orders = await Order.find({
        isActive: true,
    })
      .populate("user", "name email")
      .sort({
        createdAt: -1,
      });

    return orders;
  };

export const updateOrderStatusService = async (orderId, status) => {
    const order = await Order.findOne({
        _id: orderId,
        isActive: true,
    });

    if(!order){
        throw new Error("Order not found")
    }

    order.orderStatus = status;
    await order.save()
    return order;
}

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
        }
    );
    return deletedOrder;
}