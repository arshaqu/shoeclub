const Product = require ('../models/productModel');
const Category = require('../models/categoryModel.js')
const User = require('../models/userModel');
const Order = require('../models/orderModel');
const Razorpay = require('razorpay');
const Cart = require('../models/cartModel');
const { log } = require('util');

var instance = new Razorpay({
    key_id: 'rzp_test_EzFWmyW0JfwPhX',
    key_secret: 'UOPVb0n8NRfo3yYjE7RKdMzN'
  });

//  Loading the add products
const AddProducts = async (req,res)=>{
    try {
        const categoryData = await Category.find({})
        res.render('AddProducts',{category:categoryData})
    } catch (error) {
     console.log(error.message);   
    }
 }

//   Placing the Order as per payment Menthod 
 const placeOrder = async (req,res)=>{
    try {
        const userName = await User.findOne({_id:req.session.user_id});
        const address = req.body.address;
        const paymentMethod = req.body.payment;
        const cartData = await Cart.findOne({userId:req.session.user_id});
        const products = cartData.products;
        console.log(products);
        
        const Total = req.body.amount;
        const totalPrice = parseInt(req.body.total);
        const discount = parseInt(req.body.discount);
        const wallet = totalPrice - Total -discount;

        const status = paymentMethod === "COD" ? "placed" : "pending";
        const order = new Order({
            deliveryAddress:address,
            userId:req.session.user_id,
            userName:userName.name,
            paymentMethod:paymentMethod,
            products:products,
            totalAmount:Total,
            Amount:totalPrice,
            date:new Date(),
            status:status,
            orderWallet:wallet
        })
        console.log(order);
        const orderData = await order.save();
        if(orderData){
            for(let i=0;i<products.length;i++){
                const pro = products[i].productid;
                const count = products[i].count;
                await Product.findByIdAndUpdate({_id:pro},{$inc:{stockQuantity: -count}});
            }
            if(order.status=="placed"){
                const wal = totalPrice - Total;
                await User.updateOne({_id:req.session.user_id},{$inc:{wallet:-wal}});
                await Cart.deleteOne({userId:req.session.user_id});
                res.json({codSuccess:true});
            }else{
                const orderId = orderData._id;
                const totalAmount = orderData.totalAmount;
                var options = {
                    amount: totalAmount*100,
                    currency: "INR",
                    receipt: ""+orderId
                }
        
                instance.orders.create(options,function(err,order){
                    // console.log(order);
                    res.json({order});
                })
            }
        }else{
            res.redirect('/checkout');
        }
    } catch (error) {
        console.log(error.message);
    }
}

//  Verify and paying payment through Razorpay 
const verifyPayment = async (req,res)=>{
    try{
        const totalPrice = req.body.amount2;
        const total = req.body.amount;
        const wal = totalPrice - total;
        const details = req.body
        console.log(details);
        const crypto = require('crypto');
        let hmac = crypto.createHmac('sha256', 'UOPVb0n8NRfo3yYjE7RKdMzN');
        hmac.update(details.payment.razorpay_order_id+'|'+details.payment.razorpay_payment_id);
        hmac = hmac.digest('hex');
        if(hmac==details.payment.razorpay_signature){
            await Order.findByIdAndUpdate({_id:details.order.receipt},{$set:{status:"placed"}});
            await User.updateOne({_id:req.session.user_id},{$inc:{wallet:-wal}});
            await Order.findByIdAndUpdate({_id:details.order.receipt},{$set:{paymentId:details.payment.razorpay_payment_id}});
            await Cart.deleteOne({userId:req.session.user_id});
            res.json({success:true});
        }else{
            await Order.findByIdAndRemove({_id:details.order.receipt});
            res.json({success:false});
        }
    }catch(error){
        console.log(error.message);
    }
}
 
// Updating and Saving the Product 
 const saveproduct = async (req,res)=>{
    try {
        let image = [];
        for(i=0;i<req.files.length;i++){
        const imageUpdate =await Product.findByIdAndUpdate({_id:req.query.id},{$push:{image:req.files[i].filename}})
        }
        const productData = await Product.findOneAndUpdate({_id:req.query.id},{$set:{product:req.body.product,Stock:req.body.stock,Price:req.body.price,StockQuantity:req.body.quantity,Status:req.body.status,discription:req.body.description}})
        if(productData || imageUpdate){
            res.redirect('/admin/productList')
        }
    } catch (error) {
        console.log(error.message);
    }
}

// Adding the Products 
const insertproduct = async (req,res)=>{
    try {
        const image = [];
        for(i=0;i<req.files.length;i++){
            image[i]=req.files[i].filename;
        }
        const new_product = new Product({
            product : req.body.Product,
            stock:req.body.Stock,
            Price : req.body.Price,
            image : image,
            Category : req.body.Category,
            StockQuantity : req.body.Stockqua,
            discription : req.body.Description
        })
        const productData = await new_product.save();
        if(productData){
            res.redirect('addproduct')
        }
        else{
            console.log('error');
        }
    } catch (error) {
        console.log(error.message);
    }
}

// Listing the Product 
const productList = async (req,res)=>{
    try {
        
            const productData = await Product.find({});
            res.render('productList',{products:productData})
        
    } catch (error) {
        console.log(error.message);
    }
}
//  Loading the edit Product
 const loadeditproduct = async(req,res)=>{
    try {
        const id = req.query.id;
        const prodata = await Product.findById({_id:id});
        if(prodata){
            res.render('editProduct',{product:prodata});
        }
        else{
            res.redirect('/admin/dashboard')
        }
    } catch (error) {
        console.log(error.message);
    }
 }

// Deleting the Product
 const deleteProduct =async(req,res)=>{
    try {

        const id = req.query.id;
        const dlt = await Product.deleteOne({_id:id })
        if(dlt){
            res.redirect('/admin/productList');
        }
        else{
            res.redirect('/admin/productList');
            
        }
        
    } catch (error) {
        console.log(error.message);
    }
}

//  Loading the show Product 
const loadShowProduct = async(req,res)=>{
    try {
        const proId = req.query.id;
        const productData = await Product.findOne({_id:proId});
        res.render('product_details',{product:productData});
    } catch (error) {
        console.log(error.message);
    }
}

// Loading the Product
const loadProduct = async (req,res)=>{
    try {
        res.render('product_details')
    } catch (error) {
        console.log(error.message);
    }
}

//  Filtering the product low to high and high to low 
 const filterProduct = async (req,res)=>{
    try {
        const start = req.body.start
        const end = req.body.end
        const productData = await Product.find({ Status: true, Price: { $gt: start, $lte: end } })
        res.render('Shop',{products:productData})
    } catch (error) {
        console.log(error.message);
    }
 }

//  Delting the Image in edit Product Page
 const removeImg = async (req,res)=>{
    try {
        const id = req.body.id;
        const pos = req.body.pos;
        const dltImg = await Product.findById({_id:id});
        const image = dltImg.image[pos];
        const updataImage = await Product.findByIdAndUpdate({_id:id},{$pullAll:{image:[image]}});
        if(updataImage){
            res.json({success:true})
        }else{
            res.redirect('/admin/dashboard');
        }
    } catch (error) {
        console.log(error.message);
    }
 }

 module.exports = {
    AddProducts,
    saveproduct,
    insertproduct,
    productList,
    loadeditproduct,
    deleteProduct,
    loadShowProduct,
    loadProduct,
    placeOrder,
    verifyPayment,
    filterProduct,
    removeImg
        
    

 }