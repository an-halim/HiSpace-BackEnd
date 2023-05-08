import nodemailer from "nodemailer";

const sendMail = async (email, subject, html) => {
  let transporter = nodemailer.createTransport({
    host: "smtp-relay.sendinblue.com",
    port: 587,
    secure: false,
    auth: {
      user: "ahmadajsjdansjd@gmail.com",
      pass: "Z0yhjG8ETNsnwKfM",
    },
  });
  
  let info = await transporter.sendMail({
    from: '"HiSpace" <no-reply@hispace.com>',
    to: email,
    subject: subject,
    html: html,
  });
  return info;
}

export default sendMail;