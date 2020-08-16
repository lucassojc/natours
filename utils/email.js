const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    // activate in gmail "less secure app" option // gmail is bad option since we can just send 500 emails per day and those will be shortly marked as a spam
  });

  // 2) Define the email options
  const mailOptions = {
    from: 'Luka Jovanovic <test@test.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  // 3) Send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
