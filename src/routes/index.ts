import express from "express";
import webhookRoutes from "../controller/webhookController";

const router = express.Router();

router.get("/", async (_, res) => {
  res.send("Hello World!").status(200);
});

router.use("/webhook", webhookRoutes);

export default router;
