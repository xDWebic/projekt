import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// Vytvoření uživatele
export const createUser = async (req: Request, res: Response): Promise<void> => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400).json({ error: "Username and password are required." });
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await prisma.user.create({
            data: { username, password: hashedPassword },
        });
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: "User creation failed." });
    }
};

// Přihlášení uživatele
export const loginUser = async (req: Request, res: Response): Promise<void> => {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({ where: { username } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        res.status(401).json({ error: "Invalid credentials." });
        return;
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "secret", {
        expiresIn: "1h",
    });

    res.json({ token });
};

// Získání seznamu produktů
export const getProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const products = await prisma.product.findMany();
        console.log("Načtené produkty z databáze:", products); // Debugging
        res.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ error: "Failed to fetch products." });
    }
};

// Přidání nového produktu
export const addProduct = async (req: Request, res: Response): Promise<void> => {
    const { name, description, price } = req.body;

    if (!name || !description || price == null) {
        res.status(400).json({ error: "All fields are required." });
        return;
    }

    try {
        const product = await prisma.product.create({
            data: { name, description, price: parseFloat(price) },
        });
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ error: "Failed to add product." });
    }
};
//odstaneni produktu
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
    const productId = parseInt(req.params.id);

    if (isNaN(productId)) {
        res.status(400).json({ error: "Invalid product ID" });
        return;
    }

    try {
        // Zkontrolovat, zda produkt existuje
        const existingProduct = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!existingProduct) {
            res.status(404).json({ error: "Product not found" });
            return;
        }

        // Odstranit vazby v OrderItem (pokud existují)
        await prisma.orderItem.deleteMany({
            where: { productId: productId },
        });

        // Odstranit produkt
        await prisma.product.delete({
            where: { id: productId },
        });

        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ error: "Failed to delete product" });
    }
};

// Košík
const cart: { [key: string]: { product: any; quantity: number } } = {};
export const getCart = (req: Request, res: Response) => {
    res.json(Object.values(cart));
};
//pridani do kosiku
export const addToCart = (req: Request, res: Response) => {
    const { id, name, description, price, quantity } = req.body;

    if (!id || !name || quantity <= 0) {
        return res.status(400).json({ message: "Invalid product data" });
    }

    if (cart[id]) {
        cart[id].quantity += quantity;
    } else {
        cart[id] = { product: { id, name, description, price }, quantity };
    }

    res.json(cart);
};
//odstraneni z kosiku
export const removeFromCart = (req: Request, res: Response) => {
    const { productId } = req.params;

    if (!cart[productId]) {
        return res.status(404).json({ message: "Product not in cart" });
    }

    delete cart[productId];
    res.json(cart);
};
//hodnota 1
export const increaseQuantity = (req: Request, res: Response) => {
    const { productId } = req.params;

    if (cart[productId]) {
        cart[productId].quantity += 1;
        return res.status(200).json(cart);
    }
    return res.status(404).json({ message: "Product not found in cart." });
};
//hodnota 2
export const decreaseQuantity = (req: Request, res: Response) => {
    const { productId } = req.params;

    if (cart[productId]) {
        cart[productId].quantity -= 1;
        if (cart[productId].quantity <= 0) {
            delete cart[productId];
        }
        return res.status(200).json(cart);
    }
    return res.status(404).json({ message: "Product not found in cart." });
};
// vymaz kosiku cely
export const clearCart = (req: Request, res: Response) => {
    Object.keys(cart).forEach((key) => delete cart[key]);
    return res.status(200).json({ message: "Cart cleared successfully." });
};

//objednavky nefunguje 100%
export const createOrder = async (req: Request, res: Response): Promise<void> => {
    const { userId, products } = req.body;

    if (!userId || !products || !Array.isArray(products)) {
        res.status(400).json({ error: "Invalid request data" });
        return;
    }

    try {
        const total = products.reduce((sum, product) => sum + product.price * product.quantity, 0);

        const order = await prisma.order.create({
            data: {
                userId,
                products,
                total,
            },
        });

        res.status(201).json(order);
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ error: "Failed to create order" });
    }
};






