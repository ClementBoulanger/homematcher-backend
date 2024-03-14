var express = require('express');
var router = express.Router();
const User = require('../models/users');
const Realty = require('../models/realtys');

// Route pour gérer les notifications
router.post('/', async (req, res) => {
  const token = req.headers.authorization;
  try {
  const { realtyId, action, email } = req.body;
  // Exemple : token : rdj4_t625PhSLGrbnVh_QnlZNOO7S8-v , realtyId: 65eedb8381acc97e07b529b2 , action: realtyLike , email : email@gmail.com
  
  // Rechercher l'utilisateur en fonction du token
  const user = await User.findOne({ token });
  if (!user) {
  return res.status(404).json({ message: 'Utilisateur introuvable' });
  }
  
  // Créer un objet de notification
  let notificationMessage = '';
  if (action === 'realtyLike') {
  // Rechercher la réalité associée à realtyId
  const realty = await Realty.findById(realtyId);
  if (!realty) {
  return res.status(404).json({ message: 'Réalité introuvable' });
  }
  
  // Ajouter l'utilisateur à la liste des utilisateurs aimant cette realty
  if ( realty.likedBy.includes(user._id)){
    res.json({ message: "realty déjà liké"})
    return
    }
  realty.likedBy.push(user._id);
  await realty.save();
  
  // Créer le message de notification
  notificationMessage = `${user.username} a aimé votre bien immobilier ${realty.description}.`;
  
  // Ajouter la notification à l'utilisateur
  // Rechercher l'utilisateur dont le bien a été aimé
  const realtyOwner = await User.findById(realty.user);
  if (!realtyOwner) {
  return res.status(404).json({ message: 'Propriétaire de la réalité introuvable' });
  }
  
  // Ajouter la notification au propriétaire de la realty
  realtyOwner.notifications.push({
  action: 'realtyLike',
  by : user._id,
  realtyId,
  notificationMessage
  });
  await realtyOwner.save();
  
  } else if (action === 'profileLike') {
  // Rechercher l'utilisateur associé à l'email
  const likedUser = await User.findOne({ email });
  if (!likedUser) {
  return res.status(404).json({ message: 'Utilisateur dont le profil a été aimé introuvable' });
  }
  
  // Ajouter l'utilisateur à la liste des utilisateurs aimant ce profil
  if (likedUser.likedBy.includes(user._id)){
    res.json({message: "utilisateur déjà liké"})
    return
    }
  likedUser.likedBy.push(user._id);
  await likedUser.save();
  
  // Créer le message de notification
  notificationMessage = `${user.username} a aimé votre profil .`;
  
  // Ajouter la notification à l'utilisateur dont le profil a été aimé
  likedUser.notifications.push({
  action: 'profileLike',
  by : user._id,
  notificationMessage
  });
  await likedUser.save();
  } else {
  return res.status(400).json({ message: 'Action non prise en charge' });
  }
  
  // Enregistrer les modifications de l'utilisateur
  await user.save();
  
  return res.status(200).json({ message: 'Notification envoyée avec succès.', notificationMessage });
  } catch (error) {
  console.error('Erreur lors de la gestion des notifications :', error);
  res.status(500).json({ message: 'Une erreur est survenue lors de la gestion des notifications.' });
  }
  });

  // Route GET /notifications
  router.get('/messages', async (req, res) => {
    try {
    // Récupérer l'utilisateur en fonction du token
    const user = await User.findOne({ token: req.headers.authorization });
    if (!user) {
    return res.status(404).json({ message: "Utilisateur introuvable" });
    }
    // Renvoyer les notifications de l'utilisateur
    const notifications = user.notifications.map(notification => notification);
    return res.status(200).json({ notifications });
    } catch (error) {
    console.error('Erreur lors de la récupération des messages de notification :', error);
    res.status(500).json({ message: 'Une erreur est survenue lors de la récupération des messages de notification.' });
    }
    });

  // Route DELETE /notifications/:id
  router.delete('/:id', async (req, res) => {
    try {
    // Récupérer l'utilisateur en fonction du token
    const user = await User.findOne({ token: req.headers.authorization });
    if (!user) {
    return res.status(404).json({ message: "Utilisateur introuvable" });
    }
    
    // Convertir l'ID de la notification en un nombre entier
    const index = parseInt(req.params.id);
    
    // Vérifier si l'index est valide
    if (index < 0 || index >= user.notifications.length) {
    return res.status(404).json({ message: "Index de notification invalide" });
    }
    
    // Supprimer la notification à l'index spécifié
    user.notifications.splice(index, 1);
    
    // Enregistrer les modifications dans la base de données
    await user.save();
    
    return res.status(200).json({ message: "Notification supprimée avec succès" });
    } catch (error) {
    console.error("Erreur lors de la suppression de la notification :", error);
    res.status(500).json({ message: "Une erreur est survenue lors de la suppression de la notification" });
    }
    });
  

module.exports = router;