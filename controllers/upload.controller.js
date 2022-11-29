const HouseModel = require("../models/house.model");
const UserModel = require("../models/user.model");
const fs = require("fs");
const { promisify } = require("util");
const { uploadErrors } = require("../utils/errors.utils");
const pipeline = promisify(require("stream").pipeline);

// Générateur ID pour rename picture
function makeid(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * 
charactersLength));
 }
 return result;
};

// API POST http://localhost:5000/api/house/house.id + BODY: file = fichier image
module.exports.uploadHouse = async (req, res) => {
  try {
    if (
      // Control du type de fichier (only image)
      req.file.detectedMimeType !== "image/jpg" &&
      req.file.detectedMimeType !== "image/png" &&
      req.file.detectedMimeType !== "image/jpeg"
    )
      throw Error("Invalid file");
    // Control du poids du fichier (500ko max)
    if (req.file.size > 500000) throw Error("max size");
  } catch (err) {
    const errors = uploadErrors(err);
    return res.status(201).json({ errors });
  }

  const house = await HouseModel.findById(req.params.id);
  //console.log(house.pictures.length);
  // Construction du nom du fichier uploadé (house.id + _ + ID random généré par makeid())
  const fileName = `${house._id}_${makeid(10)}.jpg`;
  // Ecriture du fichier uploadé renomé dans /../client/public/upload/house/
  await pipeline(
    req.file.stream,
    fs.createWriteStream(
      `${__dirname}/../client/public/upload/house/${fileName}`
    )
  );
  try {
    // Ajout du fichier uploadé dans le tableau pictures de house.id
    HouseModel.findByIdAndUpdate(
        house._id,
        {
            $addToSet: { pictures: "./upload/house/" + fileName }
        },
        { new: true, upsert: true, setDefaultsOnInsert: true},
        (err, docs) => {
            if (!err) return res.send('Picture added to House: ' + req.params.id);
            else return res.status(500).send({ message: err });
        }
    )
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};

// API POST http://localhost:5000/api/user/user.id + BODY: file = fichier image
module.exports.uploadUser = async (req, res) => {
  try {
    if (
      // Control du type de fichier (only image)
      req.file.detectedMimeType !== "image/jpg" &&
      req.file.detectedMimeType !== "image/png" &&
      req.file.detectedMimeType !== "image/jpeg"
    )
      throw Error("Invalid file");
    // Control du poids du fichier (500ko max)
    if (req.file.size > 500000) throw Error("max size");
  } catch (err) {
    const errors = uploadErrors(err);
    return res.status(201).json({ errors });
  }
  // Préparation au query selector de User
  const user = await UserModel.findById(req.params.id);
  //console.log(house.pictures.length);
  // Construction du nom du fichier uploadé (user.id)
  const fileName = user._id+'.jpg';
  // Ecriture du fichier uploadé renomé dans /../client/public/upload/user/
  await pipeline(
    req.file.stream,
    fs.createWriteStream(
      `${__dirname}/../client/public/upload/user/${fileName}`
    )
  );
  try {
    // Remplacement du fichier uploadé picture de user.id
    UserModel.findByIdAndUpdate(
        user._id,
        {
            $set: { picture: fileName }
        },
        { new: true, upsert: true, setDefaultsOnInsert: true},
        (err, docs) => {
            if (!err){
              console.log('Picture added to User: ' + req.params.id);
              return res.send('Picture added to User: ' + req.params.id);
            }
            else return res.status(500).send({ message: err });
        }
    )
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};
