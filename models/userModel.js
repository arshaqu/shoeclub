const mongoose= require("mongoose");

const user  = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    mobile:{ 
        type:Number,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    is_admin:{
     type:Number,
     default:0
    },
    is_verified:{
     type:Number,
     default:0
    },
    is_blocked:{
        type:Boolean,
        default:false
    },
    token:{
        type:String,
        default:''
    },
    wallet:{
        type:Number,
        default:0
    }
});

 module.exports = mongoose.model("User",user);