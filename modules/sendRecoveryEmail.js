const nodemailer = require('nodemailer');

// Fonction pour envoyer un e-mail de récupération
function sendRecoveryEmail(email, recoveryToken) {
  let transporter = nodemailer.createTransport({
    //service: 'gmail',
    host: 'smtp.sendgrid.net', // Serveur SMTP de SendGrid
    port: 587, // Port SMTP pour les connexions non chiffrées/TLS
    secure: false, // false pour TLS
    auth: {
      user: "apikey", // Nom d'utilisateur : apikey
      pass: process.env.API_KEY   // API_KEY= "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"  
    }
  });

  let mailOptions = {
    from: "homematcher.team@gmail.com",
    to: email,
    subject: 'Récupération de mot de passe',
    text: `Bonjour,\n\nVoici votre lien de récupération de mot de passe : http://localhost:3001/users/forgotpassword/resetpassword?token=${recoveryToken}\n\nCordialement,\nl'équipe HomeMather`
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.error('Erreur lors de l\'envoi de l\'e-mail de récupération : ', error);
    } else {
      console.log('E-mail de récupération envoyé : ', info.response);
    }
  });
}

module.exports = { sendRecoveryEmail };