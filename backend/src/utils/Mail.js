import nodeMailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodeMailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});


const sendMail = async (to, otp, subject, html ) => {
    transporter.sendMail({
        from: process.env.EMAIL,
        to : to,
        subject : subject,
        html: html,
    })
}


export default sendMail;