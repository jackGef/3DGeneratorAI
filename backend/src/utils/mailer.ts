import nodemailer, { Transporter, SentMessageInfo } from 'nodemailer';

export const transporter: Transporter<SentMessageInfo> = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    // helpful debugging and timeouts
    logger: false, // set true locally if you need detailed logs
    debug: false,
    connectionTimeout: 30_000,
    greetingTimeout: 10_000,
    socketTimeout: 30_000,
});

export async function verifyTransporter(): Promise<void> {
    return new Promise((resolve, reject) => {
        transporter.verify((err) => {
            if (err) return reject(err);
            resolve();
        });
    });
}

export async function sendEmail(to: string, subject: string, text: string, html?: string): Promise<SentMessageInfo> {
    // Let errors bubble to the caller so callers can decide how to handle them.
    return transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
        html,
    });
}