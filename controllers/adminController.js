const session = require('express-session');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const User = require("../models/userModel")
const bcrypt = require('bcrypt');
const Order = require('../models/orderModel');
const { log } = require('console');

// Load the login page
const loadLogin = async (req,res)=>{
    try {
        res.render('login')
    } catch (error) {
        console.log(error.message);
    }
}
//  verifing the user for log in
const loginVerify =async (req , res)=>{
    try {
        const email=req.body.email;
        const password=req.body.password;
        const userData = await User.findOne({email:email})
        if(userData){
            const passwordMatch =await bcrypt.compare(password,userData.password)
            if(passwordMatch){
                if(userData.is_admin == 1){
                    req.session.admin_id =true;
                    res.redirect('/admin/dashboard')
                }
                else{
                    res.render('login',{message:"Entered Email or Password was incorrect"});
                }
       }
            else{
                res.render('login',{message:"Entered Email or Password is incorrect"});
            }
        }else{
            res.render('login',{message:"Email or Password is Incorrect"});
        }
    } catch (error) {
        console.log(error.message);
    }
}

//  Loading the Dashboard....
const loadDashoard = async (req, res) => {
    try {
      const orderdata = await Order.find({ status: { $ne: "CANCELED" } });
      let subtotal = 0;
      orderdata.forEach(function (value) {
        subtotal = subtotal + value.totalAmount;
      });
      const cod = await Order.find({ paymentMethod: "COD" }).count();
      const online = await Order.find({ paymentMethod: "onlinePayment" }).count();
      const totalOrder = await Order.find({
        status: { $ne: "CANCELED" },
      }).count();
      const totalUser = await User.find().count();
      const totalProducts = await Product.find().count();
      const date = new Date();
      const year = date.getFullYear();
      const currentYear = new Date(year, 0, 1);
      const salesByYear = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: currentYear },
            status: { $ne: "CANCELED" },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%m", date: "$createdAt" } },
            total: { $sum: "$totalAmount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);
      let sales = [];
      for (i = 1; i < 13; i++) {
        let result = true;
        for (j = 0; j < salesByYear.length; j++) {
          result = false;
          if (salesByYear[j]._id == i) {
            sales.push(salesByYear[j]);
            break;
          } else {
            result = true;
          }
        }
        if (result) {
          sales.push({ _id: i, total: 0, count: 0 });
        }
      }
      let yearChart = [];
      for (i = 0; i < sales.length; i++) {
        yearChart.push(sales[i].count);
      }
      res.render("dashboard", {
        data: orderdata,
        total: subtotal,
        cod,
        online,
        totalOrder,
        totalUser,
        totalProducts,
        yearChart,
      });
    } catch (error) {
      console.log(error);
    }
  };

  // Blocking the User
 const block = async (req,res)=>{
    try {

        const userdata = await User.findByIdAndUpdate({_id:req.query.id},{$set:{is_blocked:true}})
        res.redirect('/admin/users')
        
    } catch (error) {
     console.log(error.message);   
    }
 }

//  Unblocking the User
 const unblock = async (req,res)=>{
    try {
        const userdata = await User.findByIdAndUpdate({_id:req.query.id},{$set:{is_blocked:false}})
        res.redirect('/admin/users')

    } catch (error) {
     console.log(error.message);   
    }
 }

  // Listing the User
const listusers = async (req,res)=>{
    try {
        
            const userdata = await User.find({});
            res.render('users',{Users:userdata})
        
    } catch (error) {
        console.log(error.message);
    }
}

//  showing users in adminside user page 
 const newUserLoad = async(req,res)=>{
    try {
        res.render('users');
    } catch (error) {
        console.log(error.message);
    }
 }

//  For loging out of Admin
const logout = async (req,res)=>{
    try {
        req.session.admin_id = false;
        res.redirect('/admin')
    } catch (error) {
        console.log(error.message);
    }
}
  // Sale report of the sales
const salesReport = async (req, res) => {
  try {
    const limit=3
const from= req.query.from
const to = req.query.to
const page= req.query.page || 1
const stx= (page-1)*limit
const id = req.query.id
const orderData = await Order.find({ status: { $ne: "canceled" } }).sort({ date: -1 })
const size = Math.ceil( orderData.length/limit)
if(from){
  const orderData = await Order.find({date:{$gte:from,$lte:to},status:{$ne:'canceled'} }).sort({ date: -1 }).skip(stx).limit(limit)
  res.render("salesReport", { orderData ,from,to,size,id })
}else{
  const orderData = await Order.find({ status: { $ne: "canceled" } }).sort({ date: -1 }).skip(stx).limit(limit)
  res.render("salesReport", { orderData ,from,to,size,id})
}



    
  } catch (error) {
      console.log(error.message);
     
  }
}

const sorteddate = async (req, res) => {
  try {
      const limit = 6
    const fromm = req.body.from;
    const too = req.body.to;
    orderData = await Order
      .find({ status: { $ne: "CANCELED" }, date: { $gt: fromm, $lte: too } })
      .sort({ date: -1 }).limit(limit);
   const   order = await Order
      .find({ status: { $ne: "CANCELED" }, date: { $gt: fromm, $lte: too } })
      .sort({ date: -1 })
      const size= Math.ceil(order.length/limit)
      if(orderData){
    res.render("orderList", { orderData,fromm,too });
      }else{
        console.log(orderData);
      }
  } catch (error) {
    console.log(error);
  }
};



 module.exports={
    loadLogin,
    loadDashoard,
    block,
    unblock,
    loginVerify,
    newUserLoad,
    listusers,
    logout,
    salesReport,
    sorteddate
  
 }