const mongoose = require ('mongoose');
 const { type } = require('os');

 const CategorySchema = new mongoose.Schema({
    categoryName :{
        type:String,
        required : true
    },
    status:{
        type:Boolean,
        default:true
    }
 })
 module.exports = mongoose.model('Catagory',CategorySchema);

