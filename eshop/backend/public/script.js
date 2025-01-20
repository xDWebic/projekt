const API_URL = "/api/product";
const CART_URL = "/api/cart";
const ORDER_URL = "/api/order";

let cart = [];

// Načítání produktů z databáze a zobrazení na stránce
async function fetchProducts() {
    try {
        const response = await fetch(API_URL);
        const products = await response.json();

        const productList = document.getElementById("product-list");
        productList.innerHTML = products
            .map(
                (product) => `
            <div>
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <p>Cena: ${product.price} Kč</p>
                <button onclick="addToCart('${product.id}', '${product.name}', '${product.description}', ${product.price})">
                    Přidat do košíku
                </button>
            </div>
        `
            )
            .join("");
    } catch (error) {
        console.error("Error fetching products:", error);
    }
}

// Přidání produktu do košíku
async function addToCart(productId, name, description, price) {
    try {
        await fetch(CART_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: productId, name, description, price, quantity: 1 }),
        });
        fetchCart();
    } catch (error) {
        console.error("Error adding to cart:", error);
    }
}

// Získání obsahu košíku a zobrazení v modalu
async function fetchCart() {
    try {
        const response = await fetch(CART_URL);
        const cartItems = await response.json();
        cart = cartItems;

        const cartDiv = document.getElementById("cart-items");
        if (cartItems.length === 0) {
            cartDiv.innerHTML = "<p>Košík je prázdný.</p>";
            return;
        }

        cartDiv.innerHTML = cartItems
            .map(
                (item) => `
            <div>
                <h4>${item.product.name}</h4>
                <p>${item.product.description}</p>
                <p>Cena: ${item.product.price} Kč</p>
                <p>
                    Množství: 
                    <button onclick="decreaseQuantity('${item.product.id}')">-</button>
                    ${item.quantity}
                    <button onclick="increaseQuantity('${item.product.id}')">+</button>
                </p>
                <button onclick="removeFromCart('${item.product.id}')">Odstranit</button>
            </div>
        `
            )
            .join("");
    } catch (error) {
        console.error("Error fetching cart:", error);
    }
}

// Zvýšení množství produktu
async function increaseQuantity(productId) {
    try {
        await fetch(`${CART_URL}/${productId}/increase`, { method: "PATCH" });
        fetchCart();
    } catch (error) {
        console.error("Error increasing quantity:", error);
    }
}

// Snížení množství produktu
async function decreaseQuantity(productId) {
    try {
        await fetch(`${CART_URL}/${productId}/decrease`, { method: "PATCH" });
        fetchCart();
    } catch (error) {
        console.error("Error decreasing quantity:", error);
    }
}

// Odebrání produktu z košíku
async function removeFromCart(productId) {
    try {
        await fetch(`${CART_URL}/${productId}`, { method: "DELETE" });
        fetchCart();
    } catch (error) {
        console.error("Error removing from cart:", error);
    }
}

// Vyprázdnění košíku
async function clearCart() {
    try {
        await fetch(CART_URL, { method: "DELETE" });
        fetchCart();
    } catch (error) {
        console.error("Error clearing cart:", error);
    }
}

// Odeslání objednávky
async function placeOrder() {
    const name = document.getElementById("billing-name").value.trim();
    const email = document.getElementById("billing-email").value.trim();

    if (!name || !email || !validateEmail(email)) {
        alert("Zadejte platné fakturační údaje.");
        return;
    }

    if (cart.length === 0) {
        alert("Košík je prázdný.");
        return;
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    try {
        const response = await fetch("/api/order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name,
                email,
                cartItems: cart,
                total,
            }),
        });

        if (!response.ok) {
            throw new Error("Chyba při odesílání objednávky.");
        }

        const result = await response.json();
        alert("Objednávka úspěšně vytvořena!");
        cart = []; // Vyprázdní košík
        updateCartUI(); // Aktualizuje zobrazení košíku
        closeCartModal(); // Zavře modal
    } catch (error) {
        console.error("Chyba při vytváření objednávky:", error);
        alert("Nepodařilo se vytvořit objednávku.");
    }
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}


// Otevření a zavření modalu
function openCartModal() {
    fetchCart();
    document.getElementById("cart-modal").style.display = "block";
}

function closeCartModal() {
    document.getElementById("cart-modal").style.display = "none";
}

//test
document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById("theme-toggle");
    const body = document.body;

    // Check saved theme
    const savedTheme = localStorage.getItem("theme") || "light";
    if (savedTheme === "dark") {
        body.classList.add("dark");
    }

    // Toggle theme
    themeToggle.addEventListener("click", () => {
        body.classList.toggle("dark");
        const theme = body.classList.contains("dark") ? "dark" : "light";
        localStorage.setItem("theme", theme);
    });
});


// Načtení produktů při načtení stránky
document.addEventListener("DOMContentLoaded", fetchProducts);
document.getElementById("clear-cart").addEventListener("click", clearCart);
document.getElementById("place-order").addEventListener("click", placeOrder);
document.getElementById("open-cart").addEventListener("click", openCartModal);
document.getElementById("close-cart").addEventListener("click", closeCartModal);
