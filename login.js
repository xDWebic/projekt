document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            throw new Error("Invalid credentials");
        }

        const data = await response.json();

        // Uložení tokenu do localStorage
        localStorage.setItem("token", data.token);

        // Přesměrování na admin stránku
        window.location.href = "admin.html";
    } catch (error) {
        console.error("Login failed:", error);
        alert("Přihlášení selhalo. Zkontrolujte své údaje.");
    }
});
