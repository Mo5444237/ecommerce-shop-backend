const nodemailer = require('nodemailer');

const sendEmail = async (opts) => {
    const transport = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  
    const mailOptions = {
        from: process.env.EMAIL_SENDER,
        to: opts.to,
        subject: opts.subject,
        html: opts.message,
    }

    await transport.sendMail(mailOptions)
}

module.exports = sendEmail;
