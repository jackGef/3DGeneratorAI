import { Request, Response } from "express";
import { sendEmail } from "../utils/mailer.js";

export async function sendEmailHandler(req: Request, res: Response) {
    const { to, subject, text, html } = req.body as {
        to: string;
        subject: string;
        text: string;
        html?: string;
    };

    if (!to || !subject || !text) {
        return res.status(400).json({ message: "Missing required fields: to, subject, text" });
    }

    try {
        const info = await sendEmail(to, subject, text, html)
        return res.json({ok: true, messageId: info.messageId})
    } catch (error) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        return res.status(500).json({ok: false, error: msg});
    }

}