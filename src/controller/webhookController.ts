import express from "express";
import dotenv from "dotenv";
import { startConversation } from "../service/webhookService";

dotenv.config();

const router = express.Router();

router.get("/", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.status(403);
  }
});

router.post("/", async (req, res) => {
  const body = req.body;
  if (body.object === "whatsapp_business_account") {
    const response = startConversation(body);
    res.status(200).json(response);
  } else {
    res.status(400).json({ message: "Solicitação inválida." });
  }
});

export default router;
