const { match } = require('assert');
const Cart = require ('../models/cartModel');
const Category = require('../models/categoryModel')
const session = require('express-session');
const user = require('../models/userModel');
const Address = require ('../models/adressModel.js');
const Product = require ('../models/productModel');

// loading the cart page
const loadCart = async (req,res)=>{
    try {
        let id = req.session.user_id;
        let userName = await user.findOne({_id:req.session.user_id});
        let cartData = await Cart.findOne ({userId:req.session.user_id}).populate("products.productid");
        if(req.session.user_id){
            if(cartData){
                if(cartData.products.length>0){
                    const products = cartData.products;
                    const total = await Cart.aggregate([{$match:{userName:userName.name}},{$unwind:"$products"},{$project:{productPrice:"$products.productPrice", cou:"$products.count"}},{$group:{_id:null,total:{$sum:{$multiply:["$productPrice","$cou"]}}}}])    
                    const Total =total[0].total;
                    const userId = userName._id;
                    res.render('cart',{products:products,Total:Total,userId});

            }else{
                res.render('cartEmpty',{userName,message:"No Products Added to cart"})
            }

            }else{
                res.render('cartEmpty',{userName,message:"No Products Added to cart"});
            }
        }else{
    res.redirect('/')
        }
    }
     catch (error) {
        console.log(error.message);
    }
}
 
// deleting the catagory
 const deleteCatagory =async(req,res)=>{
    try {
        const id =req.query.id;
        const dlt = await Category.deleteOne({_id:id})
        if(dlt){
            res.redirect('/admin/categorylist');
        }else{
res.redirect('/admin/categorylist')
        }
    } catch (error) {
        console.log(error.message);
    }
 }

//  loading the checkout page
 const loadcheckout = async (req,res)=>{
try {
    // const userData = await user.findone ({_id:req.session.user_id})
    const userName = await user.findOne ({_id:req.session.user_id});
    const addressData = await Address.findOne({userId:req.session.user_id});
    const total = await Cart.aggregate([{$match:{userName:userName.name}},{$unwind:"$products"},{$project:{productPrice:"$products.productPrice", cou:"$products.count"}},{$group:{_id:null,total:{$sum:{$multiply:["$productPrice","$cou"]}}}}])  
    if(req.session.user_id){
        if(addressData){
            if(addressData.addresses.length>0){
                const address = addressData.addresses;
                if(total[0].total>=userName.wallet){
                    const Total = total[0].total
                    const grandTotal = (total[0].total) - userName.wallet ;
                    let customer = true;
                    res.render('checkoutPage',{customer,userName,address,Total,grandTotal});
                }else{
                    const Total = total[0].total;
                    const grandTotal = 1;   
                    let customer = true;
                    res.render('checkoutPage',{customer,userName,address,Total,grandTotal});
                }
            }else{
                let customer = true;
                res.render('emptycheckout',{customer,userName,message:"Add your delivery address"});
            }
        }else{
            let customer = true;
            res.render('emptycheckout',{customer,userName,message:"Add your delivery address"});
        }
    }else{
        res.redirect('/');
    }
} catch (error) {
    console.log(error.message);
}
 }

//  Empty checkout page.....
const emptyCheckout = async (req,res)=>{
    try {
        res.render('emptycheckout');
    } catch (error) {
        console.log(error.message);
    }
}

//  increasing and decreasing the count of the product
 const changeProductCount = async (req,res)=>{
    try {
        const userId = req.session.user_id;
        const proId = req.body.product;
        let count = req.body.count
        count = parseInt(count);
        const cartData = await Cart.findOne({userId:userId});
        const [{count:quantity}] = cartData.products;
        const productData = await Product.findOne({_id:proId});
        const price = count * productData.price;
        res.json({success:true});
        const cartdata = await Cart.updateOne({userId:userId,"products.productid":proId},{$inc:{"products.$.count":count}},{$set:{"products.$.price":price}})
        if(quantity==1){
            await Cart.updateOne(
                { userId: userId, "products.productid": proId },
                {
                  $pull: { products: { productid: proId } },
                }
              );
        }
    } catch (error) {
        console.log(error.message);
    }
 }

 
 module.exports={
    loadCart,
    deleteCatagory,
    loadcheckout,
    changeProductCount,
    emptyCheckout
 }
