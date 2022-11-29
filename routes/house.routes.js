const router = require('express').Router();
const houseController = require('../controllers/house.controller');
const uploadController = require('../controllers/upload.controller');
const multer = require('multer');
const upload = multer();

//House DB
router.get("/", houseController.getHouse);
router.post("/", houseController.createHouse);
router.put("/:id", houseController.updateHouse);
router.delete("/:id", houseController.deleteHouse);

//Upload d'image a une House
router.post("/upload/:id", upload.single('file'), uploadController.uploadHouse);
//Suppression d'image d'une House
router.delete("/pictureDelete/:id", houseController.pictureDelete);


module.exports = router;