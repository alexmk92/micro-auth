import nodemailer from "nodemailer";
import { __emailProvider__ } from "../constants";

// async..await is not allowed in global scope, must use a wrapper
export async function sendEmail(to: string, subject: string, content: string) {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: __emailProvider__.host,
    port: __emailProvider__.port,
    secure: false, // true for 465, false for other ports
    auth: {
      user: __emailProvider__.auth.user, // generated ethereal user
      pass: __emailProvider__.auth.password, // generated ethereal password
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Posterspy 👻" <ghost@posterspy.com>', // sender address
    to, // list of receivers
    subject, // Subject line
    html: content, // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

