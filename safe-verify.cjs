const fs = require("fs");
const nodemailer = require("nodemailer");

const envFile = fs.readFileSync(".env.production.local", "utf-8");
const env = envFile.split("\n").reduce((acc, line) => {
  const i = line.indexOf("=");
  if (i > -1) {
    acc[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return acc;
}, {});

const user = (env.SMTP_USER || "").replace(/^["']|["']$/g, "").trim();
const pass = (env.SMTP_APP_PASSWORD || "").replace(/[\s"']/g, "");

if (!user || !pass) {
  console.error("Missing credentials");
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: { user, pass },
});

transporter
  .verify()
  .then(() => {
    console.log("SMTP Configured and Authenticated Successfully (Runtime Check Passed)");
    process.exit(0);
  })
  .catch((err) => {
    console.error("SMTP Authentication Failed:", err.message);
    process.exit(1);
  });
