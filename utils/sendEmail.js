import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USER || process.env.EMAIL_USER,
        pass: process.env.MAIL_PASS || process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false // Allow self-signed certificates for development
    }
});

const sendEmail = async({ to, subject, html, template, templateVars }) => {
    let emailHtml = html;
    if (template) {
        const templatePath = path.join(process.cwd(), 'utils', 'emailTemplates', template);
        let templateContent = fs.readFileSync(templatePath, 'utf8');
        // Replace {{var}} in template
        Object.entries(templateVars || {}).forEach(([key, value]) => {
            templateContent = templateContent.replace(new RegExp(`{{${key}}}`, 'g'), value);
        });
        emailHtml = templateContent;
    }
    await transporter.sendMail({
        from: `"DevMatch 👩‍💻" <${process.env.MAIL_USER}>`,
        to,
        subject,
        html: emailHtml
    });
};

export default sendEmail;