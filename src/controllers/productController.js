import { createProductService, deleteProductService, getProductByIdService, getProductService, updateProductService } from "../services/productService.js"

export const createProduct = async (req,res) => {
    try {
        const product = await createProductService(req.body);

        res.status(201).json({
            success:true,
            product,
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

export const getProducts = async (req,res) => {
    try{
        const products = await getProductService();

        res.status(200).json({
            success:true,
            products,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

export const getProductById = async (req,res) => {
    try {
        const product = await getProductByIdService(req.params.id)

        if(!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            })
        }
        res.status(200).json({
            success:true,
            product,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

export const updateProduct = async (req,res) => {
    try {
        const updatedProduct = await updateProductService(
            req.params.id,
            req.body
        )

        if(!updatedProduct) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }
        res.status(200).json({
            success: true,
            product: updatedProduct,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

export const deleteProduct = async (req,res) => {
    try {
        const deletedProduct = await deleteProductService(req.params.id)

        if (!deletedProduct) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Product deleted successfully",
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}