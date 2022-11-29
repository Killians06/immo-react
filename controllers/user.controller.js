const UserModel = require('../models/user.model');
const ObjectID = require('mongoose').Types.ObjectId;
const { deletePictureErrors } = require('../utils/errors.utils');
const fs = require("fs");
const axios = require('axios');
const houseController = require('./house.controller');

// API GET http://localhost:5000/api/user/
module.exports.getAllUsers = async (req, res) => {
    const users = await UserModel.find().select('-password');
    res.status(200).json(users);
}

// API GET http://localhost:5000/api/user/user._id
module.exports.userInfo = (req, res) => {
    console.log(req.params);
    if(!ObjectID.isValid(req.params.id))
        return res.status(400).send('ID inconnu : ' + req.params.id);

    UserModel.findById(req.params.id, (err, docs) => {
        if (!err) res.send(docs);
        else console.log('ID non trouvé : ' + err );
    }).select('-password');
}

module.exports.updateUser = async (req, res) => {
    if(!ObjectID.isValid(req.params.id))
        return res.status(400).send('ID inconnu : ' + req.params.id);

    try {
        await UserModel.findOneAndUpdate(
            {_id: req.params.id},
            {
                $set:{
                    bio: req.body.bio
                }
            },
            {new: true, upsert: true, setDefaultsOnInsert: true}
        )
        .then((docs) => res.send(docs))
        .catch((err) => res.status(500).send({ message: err }));
    } catch (err) {
        res.status(500).json({ message: err });
    }
}

module.exports.deleteUser = async (req, res) => {
    if(!ObjectID.isValid(req.params.id))
        return res.status(400).send('ID inconnu : ' + req.params.id);

    try {
        await UserModel.deleteOne({_id: req.params.id})
        res.status(200).json({message: `Compte ${req.params.id} supprimé avec succes !`})
    } catch (err) {
        res.status(500).json({ message: err });
    }
}

// API DELETE http://localhost:5000/api/user/deletePicture/user.id
module.exports.pictureUserDelete = async (req, res) => {
    if(!ObjectID.isValid(req.params.id))
    return res.status(400).send('ID inconnu : ' + req.params.id);
    try {
        // Préparation du query selector user par req.params.id
        const user = await UserModel.findById(req.params.id)
        //console.log(user.picture)
        // Configuration par defaut du nom des image user
        const fileName = user._id+'.jpg';
        // Retour à la l'image par defaut
        UserModel.findByIdAndUpdate(user._id,
            {
                $set: { picture: 'default/profile.jpg' }
            },
            { new : true },
            (err, docs) => {
                if(err) res.send(err);
                else console.log('Picture de: '+ user.id +' set to default');
                return res.status(200).json('Picture de: '+ user.id +' set to default');
            }
        );
        // Suppression du fichier uploadé user.picture dans le dossier /../client/public/upload/user
        if(user.picture !== 'default/profile.jpg')
        fs.unlink(`${__dirname}/../client/public/upload/user/${fileName}`, function (err) {
            if (err) throw err;
            // if no error, file has been deleted successfully
            console.log('File deleted!');
        });
        else console.log('Aucun image')
    } catch (err) {
        const errors = deletePictureErrors(err);
        return res.status(201).json({ errors });
        //console.log(err);
    }
}