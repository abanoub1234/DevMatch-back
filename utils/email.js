import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const sendEmail = async(to, subject, text) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail', // أو smtp حسب مزود الخدمة
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            rejectUnauthorized: false // Allow self-signed certificates for development
        }
    });

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
    });
};