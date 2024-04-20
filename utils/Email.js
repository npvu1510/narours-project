const path = require('path');
const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');

class Email {
  constructor(user, url) {
    this.from = `${process.env.MAIL_FROM_NAME} <${process.env.MAIL_FROM}>`;
    this.to = user.email;

    this.firstName = user.name.split(' ')[0];

    this.url = url;
  }

  createTransporter() {
    let transporter;

    if (process.env.NODE_ENV === 'development')
      return nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,

        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      });
    else if (process.env.NODE_ENV === 'production')
      return nodemailer.createTransport({
        service: 'SendinBlue',
        auth: {
          user: 'npvu1510@gmail.com',
          pass: 'jasL0qmf8zRdwQh3',
        },
      });

    return transporter;
  }

  async send(template, subject) {
    const html = pug.renderFile(
      path.join(__dirname, '..', 'views', 'emails', template),
      { firstName: this.firstName, url: this.url }
    );

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html),
    };

    await this.createTransporter().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome.pug', 'Welcome to Natours Family');
  }

  async sendResetPassword() {
    await this.send('reset.pug', 'Reset password email');
  }
}

// const sendMail = async function (mailOptions) {
//   const transporter = nodemailer.createTransport({
//     host: process.env.MAIL_HOST,
//     port: process.env.MAIL_PORT,
//     auth: {
//       user: process.env.MAIL_USER,
//       pass: process.env.MAIL_PASS,
//     },
//   });

//   const transportObj = {
//     from: mailOptions.from,
//     to: mailOptions.to,
//     subject: mailOptions.subject,
//     text: mailOptions.text,
//   };

//   await transporter.sendMail(transportObj);
// };

module.exports = Email;
