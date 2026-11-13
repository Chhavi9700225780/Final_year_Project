
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT || 587),
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_HOST_USER,
    pass: process.env.EMAIL_HOST_PASSWORD,
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  if (
    !process.env.EMAIL_HOST_USER ||
    !process.env.EMAIL_HOST_PASSWORD
  ) {
    throw new Error("Email credentials are not configured.");
  }

  return transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_HOST_USER,
    to,
    subject,
    html,
  });
};
