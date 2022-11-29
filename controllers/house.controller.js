const axios = require('axios');
const fs = require("fs");
const HouseModel = require('../models/house.model');
const UserModel = require ('../models/user.model');
const { deletePictureErrors } = require('../utils/errors.utils');
const ObjectID = require('mongoose').Types.ObjectId;

// API GET http://localhost:5000/api/house/
module.exports.getHouse = (req, res) => {
    HouseModel.find((err, docs) => {
        if (!err){
            console.log('Houses list sent');
            res.send(docs);
        }
        else console.log('Error to get data: ' + err);
    })
}

// API POST http://localhost:5000/api/house/ + BODY: address:{number, street, post, city, state}
module.exports.createHouse = async (req, res) => {
    const {address:{number, street, post, city, state}} = req.body // Recupération des datas de req.body
    const preaddress = JSON.stringify(number+' '+street+' '+post+' '+city+' '+state); // Concatenation de l'adresse
    const address = preaddress.replace(/['"]+/g, '\''); // Concatenation de l'adresse pour la requete positionstack
    //params de l'API PositionStack
    const params = {
        access_key: process.env.POSITION_STACK_ACCESS_KEY,
        query: address,
    }
    //console.log('req.body: ');
    //console.log(req.body);
    //console.log('address: ' + address);
    const sendGetRequest = async () => {
        let location = {};
        try {
            // Requete à PositionStack pour obtenir les coordonées GPS de l'adresse
            const resp = await axios.get('http://api.positionstack.com/v1/forward', {params});
            location.latitude = resp.data.data[0].latitude;
            location.longitude = resp.data.data[0].longitude;
            //console.log(location);
        } catch (err) {
            return res.status(400).send(err);
        }
        // Préparation d'une nouvelle House
        const newHouse = new HouseModel({
            ownerId: req.body.ownerId,
            address:{number, street, post, city, state},
            location,
            pictures:[]
        });
        try {
            // Enregistrement de la Nouvelle House dans Houses DB
            const house = await newHouse.save();
            // Ajout de cette house dans l'array logements de l'ownerID
            await UserModel.findByIdAndUpdate(
                req.body.ownerId,
                {
                    $addToSet:{
                        logements: house._id
                    }
                },
                { new: true }
            )
            console.log('House created id: ' + house._id);
            return res.status(201).json('House created id: ' + house._id);
        } catch (err) {
            console.log(err);
            res.status(500).send({err})
        }
    }
    sendGetRequest();
}


module.exports.updateHouse = (req, res) => {
    if(!ObjectID.isValid(req.params.id))
    return res.status(400).send('ID inconnu : ' + req.params.id);
}

// API DELETE http://localhost:5000/api/house/house._id
module.exports.deleteHouse = async (req, res) => {
    if(!ObjectID.isValid(req.params.id))
    return res.status(400).send('ID inconnu : ' + req.params.id);
    try {
        // Préparation du query selector house par req.params.id
        const house = await HouseModel.findById(req.params.id)
        console.log('ownerId: ' + house.ownerId);
        console.log('houseId: ' + req.params.id);
        // Suppression de cette house dans l'array logements de l'ownerID
        UserModel.findByIdAndUpdate(house.ownerId,
            {
                $pull: { logements: req.params.id}
            },
            { new : true },
            (err, docs) => {
                if(err) res.send(err);
                else console.log('House id: ' + req.params.id + ' removed from user id: ' + house.ownerId);
            }
        );
        // Suppression de la House dans Houses DB
        house.delete(
            (err, docs) => {
                console.log('House id: ' + req.params.id + ' removed from Houses DB');
                if(!err) res.send('House id: ' + req.params.id + ' removed from Houses DB');
                else res.status(400).send(err);
            }
        );
    }
    catch (err) {
        return res.status(400).send(err);
    }
};

// API DELETE http://localhost:5000/api/house/house._id + BODY: index = picture[index] ( integer )
module.exports.pictureDelete = async (req, res) => {
    if(!ObjectID.isValid(req.params.id))
    return res.status(400).send('ID inconnu : ' + req.params.id);
    try {
        // Lecture de l'index envoyé par le BODY
        const index = req.body.index;
        // Préparation du query selector house par req.params.id
        const house = await HouseModel.findById(req.params.id)
        // Control que l'index existe dans house.pictures
        if(index >= house.pictures.length){
            throw Error("invalid index")
        }
        // Stockage de la valeur de house.pictures[index]
        const fileName = house.pictures[index];
        //console.log(fileName);
        // Suppression de l'image par son index dans house.pictures
        HouseModel.findByIdAndUpdate(house.id,
            {
                $pull: { pictures: house.pictures[index] }
            },
            { new : true },
            (err, docs) => {
                if(err) res.send(err);
                else console.log('Picture: ' + index + ' removed from house id: ' + house.id);
                res.status(200).json('Picture: ' + index + ' removed from house id: ' + house.id);
            }
        );
        // Suppression du fichier uploadé à l'index de house.pictures[index] dans le dossier /../client/public/upload/house
        fs.unlink(`${__dirname}/../client/public/${fileName}`, function (err) {
            if (err) throw err;
            // if no error, file has been deleted successfully
            console.log('File deleted!');
        });
    } catch (err) {
        const errors = deletePictureErrors(err);
        return res.status(201).json({ errors });
        //console.log(err);
    }
}
