import { Router } from "express";
import { dbClient } from "../db";

const router = Router();

router.get("/available", async (req, res) => {
    const availableTriggers = await dbClient.availableTrigger.findMany({});
    res.json({
        availableTriggers,
    });
});

export const triggerRouter = router;
