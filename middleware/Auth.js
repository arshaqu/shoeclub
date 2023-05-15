const { log } = require("console");
const User = require("../models/userModel")

const isLogin = async (req,res,next)=>{
 try {
    if(req.session.user_id){
    }else{
        res.redirect('/')
    }
    next();
 } catch (error) {
    console.log(error.message);
 }
}

const blocked = async(req,res,next)=>{
    try{
    const userData = await User.findOne({_id:req.session.user_id});
        if(userData.is_blocked==false){

        }else{
            req.session.destroy();
            res.redirect('/');
        }
    }catch(error){
        console.log(error.message);
    }
    next();
}

const isLogout = async (req,res,next)=>{
    try {
        if(req.session.user_id){
            res.redirect('/shop')
        }
        
        next();
    } catch (error) {
        console.log(error.message);
    }
}
module.exports={
    isLogin,
    isLogout,
    blocked
}