const sendgridMail = require("@sendgrid/mail");
const { SENDGRID_API_KEY } = require("../global");

sendgridMail.setApiKey(SENDGRID_API_KEY);

class EmailService {
    static send = (to, subject, message, html) => {
        return new Promise((resolve, reject) => {
            const data = {
                to,
                from: "noreply@uploy.app",
                subject: subject,
                text: message,
                html: html,
            };
            sendgridMail.send(data).then(resolve).catch(reject);
        });
    };
}

module.exports = EmailService;
