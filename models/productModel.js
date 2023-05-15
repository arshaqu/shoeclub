const mongoose = require ('mongoose');
const { type } = require('os');

 const productScheme = new mongoose.Schema({

    product : {
        type :String,
        required :true,
    },
    stock:{
        type:String,
        required:true
    },
    Price : {
       type : Number,
       required:true
    },
    image:{
        type : Array,
        required: true
    },
    Category : {
        type : String,
        required:true,
    },
    StockQuantity:{
        type :String,
        required:true,
    },
    Status:{
        type :Boolean,
        default:true
    },
    discription : {
        type :String,
        required:true,
    }
 })

 module.exports = mongoose.model ('product',productScheme);





 