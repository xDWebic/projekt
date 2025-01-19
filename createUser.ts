import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function createAdminUser() {
    const username = "admin";
    const email = "admin@example.com"; // Změňte na požadovaný e-mail
    const password = "admin123";
    const role = "admin";

    try {
        // Zkontroluj, zda už uživatel s tímto uživatelským jménem existuje
        const existingUser = await prisma.user.findUnique({
            where: { username },
        });

        if (existingUser) {
            console.log("Uživatel již existuje.");
            return;
        }

        // Zašifruj heslo
        const hashedPassword = await bcrypt.hash(password, 10);

        // Vytvoř uživatele
        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                role,
            },
        });

        console.log("Uživatel byl úspěšně vytvořen:", newUser);
    } catch (error) {
        console.error("Chyba při vytváření uživatele:", error);
    } finally {
        await prisma.$disconnect();
    }
}

createAdminUser();
