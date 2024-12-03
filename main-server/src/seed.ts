import { PrismaClient } from "@prisma/client";
const prismaClient = new PrismaClient();

async function main() {
    await prismaClient.availableTrigger.create({
        data: {
            id: "webhook",
            name: "Webhook",
            image: "https://cdn-icons-png.flaticon.com/512/919/919829.png",
        },
    });

    await prismaClient.availableAction.create({
        data: {
            id: "sol",
            name: "Send Solana",
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKzuey_kolTdybBbBekD_RYzEe5XXHI4eAGg&s",
        },
    });

    await prismaClient.availableAction.create({
        data: {
            id: "email",
            name: "Send Email",
            image: "https://cdn-icons-png.flaticon.com/512/666/666162.png",
        },
    });
}

main();
