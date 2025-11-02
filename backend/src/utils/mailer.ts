import nodemailer, { Transporter, SentMessageInfo } from 'nodemailer';

export const transporter: Transporter<SentMessageInfo> = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
});

export async function sendEmail(to: string, subject: string, text: string, html?: string): Promise<SentMessageInfo> {
    return transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
        html,
    });
}