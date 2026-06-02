import { createOrderService, getAllOrdersService, getMyOrderService, updateOrderStatusService, deleteOrderService} from "../services/orderService.js"

export const createOrder = async (req, res) => {
    try {
        console.log("CREATE ORDER USER:", req.user._id);
        const { items, sessionId } = req.body;
        const order = await createOrderService(req.user._id, items,sessionId);

        res.status(201).json({
            success:true,
            order,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

export const getMyOrders = async(req,res) => {
    try {
        console.log("GET MY ORDERS USER:", req.user._id);
        const orders = await getMyOrderService(req.user._id);

        res.status(200).json({
            success:true,
            orders,
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

export const getAllOrders = async (req,res) => {
    try {
        const orders = await getAllOrdersService()

        res.status(200).json({
            success:true,
            orders,
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

export const updateOrderStatus = async (req,res) => {
    try {
        const {status} = req.body;

        const order = await updateOrderStatusService(req.params.id, status);

        res.status(200).json({
            success: true,
            order,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

export const deleteOrder = async (req,res) => {
    try {
        const deletedOrder = await deleteOrderService(req.params.id);

        if(!deletedOrder) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }
        res.status(200).json({
            success: true,
            message:"Order deleted successfully",
            order: deletedOrder,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}