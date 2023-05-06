import nodemailer from 'nodemailer';

export const sendEmail = async ({

    to = '',
    message = '',
    subject = '',
    attachments = []

}) =>
{
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com', //ifFail : smtp.gmail.com || localhost
        port: 587,
        secure: false,
        service: 'gmail',
        auth: {
            user: process.env.SENDER_EMAIL,
            pass: process.env.SENDER_PASS
        }
    });

    const info = await transporter.sendMail({
        from: `Dola Company < ${process.env.SENDER_EMAIL}>`,
        to,
        html: message,subject,attachments
    });
    if (info.accepted.length)
    {
        return true
    }
    return false
};