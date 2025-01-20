import { Router } from "express";
import {
    createUser,
    loginUser,
    getProducts,
    addProduct,
    getCart,
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    createOrder,
    deleteProduct
} from "./controllers";

const router = Router();

router.post("/auth/login", loginUser);
router.post("/auth/user", createUser);
//produkty
router.get("/product", getProducts);
router.post("/product", addProduct);
router.delete('/product/:id', deleteProduct);

//kosik
router.get("/cart", getCart);
router.post("/cart", addToCart);
router.delete("/cart/:productId", removeFromCart);
router.patch("/cart/:productId/increase", increaseQuantity);
router.patch("/cart/:productId/decrease", decreaseQuantity);
router.delete("/cart", clearCart);
//objednavky
router.post('/order', createOrder);



export { router as routes };
