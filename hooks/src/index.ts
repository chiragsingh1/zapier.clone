/*
    hooks: Service to create a zap, it's trigger and it's actions and store it in database.
    Database used: PostgreSQL with Prisma ORM.
    Only one trigger type: webhook is supported.
    Use Case: When a zap event is created, the trigger will be a webhook url. 
    Hit the webhook url along with it's actions (example: send a mail, send money etc.) and the zap will be created.
    This zap is stored in the table Zap. When a Zap is run using the webhook trigger url, it is called a ZapRun.
    ZapRun is stored in two places: ZapRun and ZapRunOutbox.
    Ultimately, the ZapRun is to be stored in DB and pushed into a Kafka Queue. But if the service goes down
    after storing the zaprun in DB and before pushing it in queue, the atomicity will hinder.
    To solve this, we push the zaprun into the queue from a clone table called ZapRunOutbox.

    processor: Service to loop and fetch pending ZapRuns from ZapRunOutbox table and push it into Kafka Queue
    and delete the zaprun from outbox.
    
    kafka-worker: Kafka consumer service.

 */

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
