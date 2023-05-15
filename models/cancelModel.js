 const mongoose = require ('mongoose');
 const cancelSchema = new mongoose.Schema({
 reason :{
    type:String,
    required:true
 }
 }) 

 const cancelModel = mongoose.model("cancel",cancelSchema);
 module.exports = cancelModel;