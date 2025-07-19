import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  // Parse form data
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk);
  const buffer = Buffer.concat(chunks);

  // Use a library like 'formidable' or 'busboy' for real parsing
  // For demo, skip parsing and just send a dummy email

  // Setup Nodemailer
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: req.body.email,
    subject: `Invoice Receipt - ${req.body.invoiceNumber}`,
    text: `Dear ${req.body.name},\n\nPlease find attached your invoice receipt.`,
    attachments: [
      {
        filename: `${req.body.invoiceNumber}.pdf`,
        content: buffer,
      },
    ],
  });

  res.status(200).json({ success: true });
}