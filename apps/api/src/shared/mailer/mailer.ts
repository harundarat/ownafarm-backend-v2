import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { logger } from "../logger/logger.js";

export interface MailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export async function sendMail(options: MailOptions): Promise<void> {
  await transporter.sendMail({
    from: env.SMTP_FROM,
    ...options,
  });
}

export async function verifyMailer(): Promise<void> {
  await transporter.verify();
  logger.info("mailer connected");
}
