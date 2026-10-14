require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

transporter.verify(
  /**
   * Logs whether the configured email transport is ready.
   *
   * @param {Error|null} error - Verification error, if the connection failed.
   * @param {boolean} success - Whether the transport is ready.
   * @returns {void}
   */
  (error, success) => {
    if (error) {
      console.error("Error connecting to email server:", error);
    } else {
      console.log("Email server is ready to send messages");
    }
  },
);

/**
 * Sends an email using the configured Nodemailer transport.
 *
 * Send failures are logged and swallowed, so this function resolves after
 * either a successful send or a failed send attempt.
 *
 * @param {string} to - Recipient email address.
 * @param {string} subject - Email subject.
 * @param {string} text - Plain-text message body.
 * @param {string} html - HTML message body.
 * @returns {Promise<void>} Resolves after the send attempt completes.
 */
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend Ledger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

/**
 * Sends a welcome email after a user registers.
 *
 * @param {string} userEmail - Email address of the newly registered user.
 * @param {string} name - User's name for the greeting.
 * @returns {Promise<void>} Resolves after the email send attempt completes.
 */
async function sendRegisterationEmail(userEmail, name) {
  const subject = "Welcome to Backend Ledger!";
  const text = `Hello ${name}, \n\n Thank you for registering at Backend Ledger. We're excited to have you on board! \n\nBest regards, \nThe Backend Ledger Team`;
  const html = `
      <p>Hello ${name},</p>
      <p>
        Thank you for registering at Backend Ledger. We're excited to have you
        on board!
      </p>
      <p>
        Best regards,<br>
        The Backend Ledger Team
      </p>
    `;

  await sendEmail(userEmail, subject, text, html);
}

/**
 * Sends the customer a confirmation that their transaction completed.
 *
 * @param {string} userEmail - Email address of the customer.
 * @param {string} name - Customer's name for the greeting.
 * @param {number} amount - Transaction amount.
 * @param {string} toAccount - Destination account identifier.
 * @returns {Promise<void>} Resolves after the email send attempt completes.
 */
async function sendTransactionEmail(userEmail, name, amount, toAccount) {
  const subject = "Transaction Successful!";
  const text = `Hello ${name},\n\nYour transaction of $${amount} to account ${toAccount} was completed successfully.\n\nBest regards,\nThe Backend Ledger Team`;
  const html = `
    <p>Hello ${name},</p>
    <p>Your transaction of $${amount} to account ${toAccount} was completed successfully.</p>
    <p>Best regards,<br>The Backend Ledger Team</p>
  `;

  await sendEmail(userEmail, subject, text, html);
}

/**
 * Notifies the customer that their transaction could not be completed.
 *
 * @param {string} userEmail - Email address of the customer.
 * @param {string} name - Customer's name for the greeting.
 * @param {number} amount - Transaction amount.
 * @param {string} toAccount - Destination account identifier.
 * @returns {Promise<void>} Resolves after the email send attempt completes.
 */
async function sendTransactionFailureEmail(userEmail, name, amount, toAccount) {
  const subject = "Transaction Failed";
  const text = `Hello ${name},\n\nYour transaction of $${amount} to account ${toAccount} could not be completed. Please review your account details and balance, then try again. If the issue continues, contact our support team.\n\nBest regards,\nThe Backend Ledger Team`;
  const html = `
    <p>Hello ${name},</p>
    <p>Your transaction of $${amount} to account ${toAccount} could not be completed.</p>
    <p>Please review your account details and balance, then try again. If the issue continues, contact our support team.</p>
    <p>Best regards,<br>The Backend Ledger Team</p>
  `;

  await sendEmail(userEmail, subject, text, html);
}

module.exports = {
  sendRegisterationEmail,
  sendTransactionEmail,
  sendTransactionFailureEmail,
  sendEmail,
};
