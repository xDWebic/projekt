const API_URL = "/api/product";

//Produkty
async function fetchProducts() {
    try {
        const response = await fetch(API_URL);
        const products = await response.json();
        console.log("Načtené produkty:", products); // Debugging
        renderProducts(products); // Zavolání funkce pro vykreslení
    } catch (error) {
        console.error("Error fetching products:", error);
    }
}

// Funkce pro vykreslení produktů
function renderProducts(products) {
    const productList = document.getElementById("product-list");
    if (!products || products.length === 0) {
        productList.innerHTML = "<p>Žádné produkty nebyly nalezeny.</p>";
        return;
    }

    productList.innerHTML = products
        .map(
            (product) => `
        <div>
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <p>Cena: ${product.price} Kč</p>
            <button onclick="deleteProduct(${product.id})">Smazat</button>
        </div>
    `
        )
        .join("");
}

async function addProduct(name, description, price) {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, description, price }),
        });

        if (!response.ok) throw new Error("Failed to add product");

        fetchProducts(); // Aktualizace seznamu produktů
    } catch (error) {
        console.error("Error adding product:", error);
    }
}

// Smazání produktu
async function deleteProduct(productId) {
    try {
        const response = await fetch(`${API_URL}/${productId}`, {
            method: "DELETE",
        });
        body: JSON.stringify({ name, description, price })
        if (!response.ok) throw new Error("Failed to delete product");

        fetchProducts(); // Aktualizace seznamu produktů
    } catch (error) {
        console.error("Error deleting product:", error);
    }
}

document.getElementById("add-product-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const description = document.getElementById("description").value;
    const price = parseFloat(document.getElementById("price").value);

    if (!name || !description || isNaN(price)) {
        console.error("Invalid input data");
        return;
    }

    addProduct(name, description, price);
});

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


document.addEventListener("DOMContentLoaded", fetchProducts);
