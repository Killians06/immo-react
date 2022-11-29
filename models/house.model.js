const mongoose = require('mongoose');

const houseSchema = new mongoose.Schema(
    {
        ownerId: {
            type: String,
            require: true
        },
        address: {
            number: {
             type: Number,
             required: true,
             maxlength: 25,
             trim: true
             },
             street: {
                 type: String,
                 required: true,
                 trim: true
             },
             post: {
                 type: String,
                 required: true,
                 minlength: 2,
                 maxlength: 5,
                 trim: true
             },
             city: {
                 type: String,
                 required: true,
                 trim: true
             },
             state: {
                 type: String,
                 required: true,
                 trim: true
             },
             
         },
         location: {
            latitude: {
                type: String,
                required: true,
                trim: true
            },
            longitude: {
                type: String,
                required: true,
                trim: true
            }
        },
        pictures: {
            type: [String],
            require: true
        },
    },
    {
        timestamps: true,
    }
);

const HouseModel = mongoose.model('house', houseSchema);

module.exports = HouseModel;