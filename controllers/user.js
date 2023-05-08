const express = require("express");
const jwt = require('jsonwebtoken');
const bcrypt=(require('bcrypt'))

const {
  sequelize,
  User
} = require("../models/Book");
const path = require('path');


exports.registerUser= async (req, res) => {
  try {
    const { email,name, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, name,password: hashedPassword });
    res.status(201).json({ user: { email: user.email, name: user.name } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating user' });
  }
};
exports.UserLogin= async (req, res) => {
  
  const { email, password } = req.body;

  // Recherche de l'utilisateur dans la base de données
  const user = await User.findOne({ where: { email } });

  if (!user) {
    // L'utilisateur n'existe pas
    return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
  }

  // Vérification du mot de passe
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    // Le mot de passe est incorrect
    return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
  }

  // Création d'un JWT contenant les informations de l'utilisateur
  const token = jwt.sign({ id: user.id,name:user.name, email: user.email }, process.env.JWT_KEY, { expiresIn: '6h' });

  // Envoi du token dans la réponse
  res.json({ token});
};
exports.createUser=async (req, res) => {
  try {
    const { email,name, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, name,password: hashedPassword });
    res.status(201).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating user' });
  }
};

exports.UserLogin=async (req, res) => {
  const { email, password } = req.body;

  // Recherche de l'utilisateur dans la base de données
  const user = await User.findOne({ where: { email } });

  if (!user) {
    // L'utilisateur n'existe pas
    return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
  }

  // Vérification du mot de passe
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    // Le mot de passe est incorrect
    return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
  }

  // Création d'un JWT contenant les informations de l'utilisateur
  const token = jwt.sign({ id: user.id,name:user.name, email: user.email }, process.env.JWT_KEY, { expiresIn: '6h' });

  // Envoi du token dans la réponse
  res.json({ token});
};
exports.updateUser=async (req, res, next) => {
  const userId = req.userId;
  
  const { name } = req.body;
  try {
    const user = await User.findOne({ where: { id: userId } });
   
    if (!user) {
      return res.status(404).send("Utilisateur introuvable");
    }
    // Vérifier si l'utilisateur a le livre dans sa liste
   
    // Mettre à jour le livre
    await user.update({
     name
    });
  
   
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send("Une erreur est survenue lors de la mise à jour  des informations utilisateur");
  }
};
exports.getAllUsers= async (req, res) => {

try{
  const Users= await User.findAll({
    where:{role:'user'}
   
  })
 
  res.json(Users);
}
catch (err) {
  console.error(err);
  res
    .status(500)
    .send(
      "Une erreur est survenue lors de la récupération du livre."
    );
}
}
exports.deleteUser= async (req, res, next) => {
  const userId = req.userId;
 
  try {
    // Vérifier si l'utilisateur a le livre dans sa liste
    const user = await User.findOne({ where: { id: userId } });
    
    if (!user) {
      return res.status(404).send("Utilisateur");
    }
    
    
    await user.destroy(); 
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).send("Une erreur est survenue lors de la suppression de l'utilisateur");
  }
};