const dotenv = require('dotenv')
dotenv.config()
const User = require("../models/userModel")
const bcrypt = require('bcrypt');
const nodemailer=require("nodemailer");
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const Banner = require('../models/bannerModel');
const Cart = require('../models/cartModel');
const randomstring = require('randomstring');
const { emailPassword } = require("../config/confiq");
const { stringify } = require("querystring");
const config = require = require('../config/confiq')


let otp;

// Securing the password
// ====================

const securePassword = async(password)=>{
    try {
       const passwordHash = await bcrypt.hash(password,10);
       return passwordHash;

    } catch (error) {
        console.log(error.message);
    }
}

//  Updating and Saving Profile of the User 
const saveProfile = async(req,res)=>{
    try {
       const userData = await User.findOneAndUpdate({'_id':req.session.user_id},{$set:{name:req.body.name,mobile:req.body.mobile}})
       res.redirect('/profile');

    } catch (error) {
        console.log(error.message);
    }
}

// FOR SENT MAIL....
// ===============
const sendVerifyMail=async(name,email,otp)=>{
    try {
        const transporter=nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:"mycartzone101@gmail.com",
                pass:process.env.PASS
            }
        })
        const mailOPtion={
            form:"mycartzone101@gmail.com",
            to:email,
            subject:'for verification mail',
            html:'<p>Hi '+name+', please click here to<a href="http://localhost:3000/otp">varify</a> and enter the for your verification '+email+'this is your otp'  +otp+ '</p>',

        }
    
        transporter.sendMail(mailOPtion,function(error,info){
            if(error){
                console.log(error);
            }
            else{
                console.log("email has been send",info.response);
                console.log(otp);
            }
        })
        
    } catch (error) {
        console.log(error.message)
        
    }
    }

  // For Reset Password sent email...
  //=================================
let token_to_verify;
  const sendResetPassword=async(name,email,token,uid)=>{
    try {
        token_to_verify=token;
        
        const transporter=nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:'mycartzone101@gmail.com',
                pass:'noksogqtagchbhok'
            }
        })
        const mailOPtion={
            from:config.emailUser,
            to:email,
            subject:'For Reset Password',
            html:'<p>Hi '+name+',please click here to <a href=http://localhost:3000/forget_verifiy?token='+token+'&&uid='+uid+'>varify</a> and enter the for your verification reset your password </p>',

        }
    
        transporter.sendMail(mailOPtion,function(error,info){
            if(error){
                console.log(error);
            }
            else{
                console.log("email has been send",info.response);
            }
        })
        
    } catch (error) {
        console.log(error.message)
        
    }
    }
 
    // Forget User Password and verifying the user 
    const forget_verifiy = async(req,res)=>{
        try {
             token = req.query.token;
             user_id = req.query.uid;
             if(token==token_to_verify){
                const userData = await User.findOne({_id:user_id});
              res.render('change_pass',{user:userData});
             }
    
        } catch (error) {
            console.log(error.message);
        }
    }

    // Changing the password of the user through email 
    const change_pass = async(req,res)=>{
        try {
            const pass = req.body.password;
             const con_pass = req.body.confirm_pass;
             const user_id = req.body.uid;
             const passwordHash = await bcrypt.hash(pass,10);        
             if(pass==con_pass){
                const userData = await User.updateOne({_id:user_id},{$set:{password:passwordHash}});
                if(userData){
              res.redirect('/login');
                }
                else{
res.render('change_pass',{message:"Somthing went wrong"});
                }
             }
        } catch (error) {
            console.log(error.message);
        }
    }
  

// For HomePage
// ============
const loadHome = async (req,res)=>{
    try {
        const bannerData = await Banner.find({});  
        res.render('home',{banner:bannerData})
    } catch (error) {
        console.log(error.message);
    }

}
//  Registration of user and senting mail to user
//  =============================================
let email;
const insertUser = async(req,res)=>{
    const spassword = await securePassword(req.body.password)
    try {
        const user = new User({
              name: req.body.name,
              email: req.body.email,
              mobile: req.body.mobile,
              password: spassword,
              is_admin:0
          });
          email=user.email;

  const name1=req.body.name
  const isExists = await User.findOne({email:req.body.email});
  if(isExists){
    res.render('register',{message:"This Email is already exists"})
  }
else{
        const userData = await  user.save();
          if(userData){ 
            randomNumber = Math.floor(Math.random() * 9000) + 1000;
          otp=randomNumber
            sendVerifyMail(name1,req.body.email,randomNumber)
              res.redirect("/verification")
          }

          else{
              res.render('register',{message:'Your registration has been failed'})
          }
      }
    }
      catch(error){
          console.log(error.message);
      }
  }

//  creating Login page 
//  ===================
 const loginload = async(req,res)=>{
    try{
        res.render('login')
    }
    catch(error){
        console.log(error.message);
    }
 }

//  Register page of user
//  =====================
 const loadRegister = async(req,res)=>{
    try{
        res.render('register');
    }catch(error){
        console.log(error.message);
    }
 }
// verification page of user
// ==========================
 const loadVerfication = async(req,res)=>{
 try {
    res.render('verification')
 } catch (error) {
    console.log(error.message);
 }
 }

//  Verifying the user and senting male for OTP 
 const verifyLogin = async(req,res)=>{
    try {
        email = req.body.email;
        const password = req.body.password;
       const userData = await User.findOne({email:email, is_blocked : false});
       if(userData){
      const passwordMatch = await bcrypt.compare(password,userData.password)
        if(passwordMatch){
            if(userData.is_verified == 1){
                req.session.user_id = userData._id;
                res.redirect('/home');
            }
            else {
            randomNumber = Math.floor(Math.random() * 9000) + 1000;
            otp=randomNumber
            sendVerifyMail(req.body.name,req.body.email,randomNumber)
              res.redirect("/verification")
          }
      }
        else{
         res.render('login',{message:"Email and Password are incorrect."})
        }
    }
       else{
        res.render('login',{message:"User not found!!!"});
       }
    }
  catch (error) {
        console.log(error.message);
    }  
}


//  Shop page 
const loadShop = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 2;
        const limit = parseInt(req.query.limit) || 6;
        const skip = (page - 1) * limit;
        const data = await Category.find()
        const search=req.query.search
        
       const category = req.query.category
        const totalCount = await Product.find().count()
       const products = await Product.find().skip(skip).limit(limit)
           if(req.query.category){
            if(req.query.sort){
                const sort = parseInt(req.query.sort)
                            const products = await Product.find({Category:req.query.category}).sort({Price:sort})
                            res.render('Shop', {
                                products: products,
                                currentPage: page,
                                totalPages: Math.ceil(totalCount / limit),
                                limit: limit,
                                data,
                                category,
                                search
                            });
            }else{
                const products = await Product.find({Category:req.query.category})
                res.render('Shop', {
                    products: products,
                    currentPage: page,
                    totalPages: Math.ceil(totalCount / limit),
                    limit: limit,
                    data,
                    category,
                    search
                });
            }
           }else if(req.query.search && req.query.sort !=''){
const sort = parseInt(req.query.sort)
            const products = await Product.find({$or:[{product:{$regex:".*"+req.query.search+".*",$options:'i'}}]}).sort({Price:sort})
            res.render('Shop', {
                products: products,
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                limit: limit,
                data,
                category,
                search
            });
           }else if(req.query.search){
            const products = await Product.find({$or:[{product:{$regex:".*"+req.query.search+".*",$options:'i'}}]})
            res.render('Shop', {
                products: products,
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                limit: limit,
                data,
                category,
                search
            });
           }else{
            res.render('Shop', {
                products: products,
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                limit: limit,
                data,
                category,
                search
            });
           }
    } catch (error) {
        console.log(error.message);
    } 
}

//  Verifying the users otp and redirecting to login page
//  =====================================================
const verifyLoad = async (req,res)=>{
    const otp2= req.body.otp;
    try { 
        if(otp2==otp){
            const UserData = await User.findOneAndUpdate({email:email},{$set:{is_verified:1}});
            if(UserData){
            res.redirect('/')
            }
            else{
                console.log('something went wrong');
            }
        }
        else{
            res.render('verification',{message:"Please Check the OTP again!"})
        }
    } catch (error) {
        console.log(error.message);
    }
}

// Logouting the user 
const userLogout = async(req,res)=>{
    try {
        req.session.user_id = false;
        res.redirect('/');
    } catch (error) {
        console.log(error.message);
    }
}

// Loading the Cart 
const cart = async (req,res)=>{
    try {
        let user_id = req.session.user_id;
        let cart_items = Cart.find({userId:user_id})
        console.log(cart_items.products);
       res.render('cart')
    } catch (error) {
        console.log(error.message);
    }
}

//  Adding the Product into the Cart 
const addtocart = async (req,res)=>{
    try {
        let id = req.body.id
        let productData = await Product.findById({_id:id});
        let userName = await User.findOne({_id:req.session.user_id});
        let cartData =await Cart.findOne({userId:userName._id});
        if(cartData){
            let proExit = await cartData.products.findIndex(
                (Product)=>Product.productid == id)
                if(proExit != -1){
                    await Cart.updateOne({userId:req.session.user_id,"products.productid":id},{$inc:{"products.$.count":1}})
                    res.json({success:true})
                }   else{
                    await Cart.findOneAndUpdate({userId:req.session.user_id},{$push:{products:{productid:id,productPrice:productData.Price}}});
                    res.json({success:true});
                }
            }else{
                const cart= new Cart({
                    userId:userName._id,
                    userName:userName.name,
                    products:[{
                        productid:productData._id,
                        productPrice:productData.Price
                    }]
                });
                const cartData = await cart.save();
                if(cartData){
                    res.json({success:true})
                }else{
                    res.redirect('/shop');
                }
            }
    } catch (error) {
        console.log(error.messge);
    }
}

//  Loading the forget password Page 
 const forgetLoad = async(req,res)=>{
    try {
        res.render('forget')
    } catch (error) {
        console.log(error.message);
    }
 }

//   Verifying user and senting the reset password link to the mail 
 const forgetVerify = async(req,res)=>{
    try {
        const email = req.body.email;
        const userData= await User.findOne({email:email})
        const uid=userData._id;
        if(userData){
            const randomString = randomstring.generate();
        if(userData.is_verified == 0){
            res.render('forget',{message:"Please Verify Your Mail"});
        }else{
            const randomString = randomstring.generate();
            const updatedData = await User.updateOne({email:email},{$set:{token:randomString}})
            console.log(updatedData);
            sendResetPassword(userData.name,userData.email,randomString,uid);
            res.render('forget',{message:"Pleace Check Your Mail to reset your password"});
        }
        }else{
            res.render('forget',{message:"Email is Incorrect"});
        }
    } catch (error) {
     console.log(error.message);
    }
 }

//   Loading the profile page of the user 
 const loadProfile = async(req,res)=>{
    try {
        const UserData = await User.findOne({_id:req.session.user_id});
        const userName =await User.findOne({_id:req.session.user_id});
        res.render('profile',{UserData,userName});
    } catch (error) {
        console.log(error.message);
    }
 }

//   Searching the User 
 const searchUser = async(req,res)=>{
    try {
        const searchValue = req.body.search
        const search = searchValue.trim();

        if (search != ''){
            const productData = await product.find({name:{$regex: `^${search}`,$options:'i'}});
        }
        res.render('shop',{productData,Value})

    } catch (error) {
        console.log(error.message);
    }
 }


module.exports={
    insertUser,
    loginload,
    verifyLogin,
    loadHome,
    loadRegister,
    loadVerfication,
    sendVerifyMail,
    saveProfile,
    verifyLoad,
    change_pass,
    forget_verifiy,
    loadShop,
    userLogout,
    cart,
    addtocart,
    forgetLoad,
    forgetVerify,
    loadProfile,
    searchUser
}


