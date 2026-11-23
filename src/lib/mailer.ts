import nodemailer from "nodemailer";

type MailMessage = {
  to: string;
  subject: string;
  text: string;
};

function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass || !Number.isFinite(port)) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

async function sendMail(message: MailMessage) {
  const from = process.env.SMTP_FROM;
  const transport = createTransport();
  if (!from || !transport) {
    console.warn("Email notification skipped: SMTP settings or SMTP_FROM are incomplete");
    return;
  }

  try {
    await transport.sendMail({
      from: `${process.env.SMTP_FROM_NAME || "AcctMarket"} <${from}>`,
      ...message,
    });
  } catch {
    console.error("Email notification could not be delivered");
  }
}

export async function notifyAdminOfFunding(input: {
  amount: number;
  senderName: string;
  customerName: string | null;
  customerEmail: string;
  reference: string;
  createdAt: Date;
}) {
  const to = process.env.MANUAL_TRANSFER_ALERT_EMAIL;
  if (!to) {
    console.warn("Funding alert skipped: MANUAL_TRANSFER_ALERT_EMAIL is not configured");
    return;
  }

  await sendMail({
    to,
    subject: `Manual transfer awaiting review: ₦${input.amount.toLocaleString("en-NG")}`,
    text: [
      "A customer says they sent a wallet-funding transfer. Confirm it in your bank account before approving.",
      "",
      `Amount: ₦${input.amount.toLocaleString("en-NG")}`,
      `Sender account name: ${input.senderName}`,
      `Customer: ${input.customerName || "Customer"}`,
      `Customer email: ${input.customerEmail}`,
      `Reference: ${input.reference}`,
      `Submitted: ${input.createdAt.toLocaleString("en-NG", { timeZone: "Africa/Lagos" })}`,
      "",
      "Review this request in the admin Funding page.",
    ].join("\n"),
  });
}

export async function notifyCustomerOfFundingDecision(input: {
  email: string;
  name: string | null;
  amount: number;
  reference: string | null;
  decision: "approved" | "declined";
}) {
  const approved = input.decision === "approved";
  await sendMail({
    to: input.email,
    subject: approved ? "Your wallet funding was approved" : "Your wallet funding was declined",
    text: [
      `Hello ${input.name || "there"},`,
      "",
      approved
        ? `Your wallet funding request for ₦${input.amount.toLocaleString("en-NG")} has been approved and your wallet has been credited.`
        : `Your wallet funding request for ₦${input.amount.toLocaleString("en-NG")} was declined. Please contact support if you believe this is a mistake.`,
      input.reference ? `Reference: ${input.reference}` : "",
      "",
      "AcctMarket",
    ].filter(Boolean).join("\n"),
  });
}
