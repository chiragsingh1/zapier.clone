import express from "express";
import { PrismaClient } from "@prisma/client";

const app = express();
const db = new PrismaClient();

app.use(express.json());

app.post("/hooks/catch/:userId/:zapId", async (req, res) => {
    const userId = req.params.userId;
    const zapId = req.params.zapId;

    // store in DB a new trigger
    await db.$transaction(async (tx) => {
        const run = await tx.zapRun.create({
            data: {
                zapId: zapId,
                metadata: req.body,
            },
        });

        await tx.zapRunOutbox.create({
            data: {
                zapRunId: run.id,
            },
        });
    });

    // push it into a queue redis/kafka

    res.json({
        message: "Webhook received",
    });
});

app.listen(3000);
