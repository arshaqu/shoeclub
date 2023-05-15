// const { log } = require('console');
const Product = require ('../models/productModel');
const Wishlist = require('../models/wishlistModel');
const cart = require('../models/cartModel');
const User = require('../models/userModel');
const { ObjectId } = require('mongodb');

//  Loading the wishlist page 
const wishlistLoad = async(req,res)=>{
    try {
        const userName = await User.findOne({_id:req.session.user_id});
        const wishlistData = await Wishlist.findOne({user:req.session.user_id}).populate("products.productId");
        const wish = wishlistData.products;
        if(wish.length>0){
            if(req.session.user_id){
                res.render('wishlist',{userName,wish});
            }else{
                res.redirect('/');
            }
        }else{
            res.render('emptyWishlist',{message:"No product added to wishlist"});
        }
    } catch (error) {
        console.log(error.message);
    }
}

//  Adding the Products to Wishlist
const addToWishlist = async(req,res)=>{
    try{
        const proId = req.body.query;
        const user = await User.findOne({_id:req.session.user_id})
        const productData = await Product.findOne({_id:proId});
        const wishlistData = await Wishlist.findOne({user:req.session.user_id});
        if(wishlistData){
            const checkWishlist = await wishlistData.products.findIndex((wish)=> wish.productId == proId);
            console.log(checkWishlist);
            if(checkWishlist != -1){
                res.json({check:true})
            }else{
                await Wishlist.updateOne({user:req.session.user_id},{$push:{products:{productId:proId}}});
                res.json({success:true});
            }
        }else{
            const wishlist = new Wishlist({
                user:req.session.user_id,
                userName:user.name,
                products:[{
                    productId:productData._id
                }]
            })

            const wish = await wishlist.save();
            if(wish){
                res.json({success:true});
            }
        }
    }catch(error){
        console.log(error.message);
    }
}

//  Removing the Products from the Wishlist 
const removeWishlist = async(req,res)=>{
    try {
        const id = req.query.id;
        await Wishlist.updateOne({user:req.session.user_id},{$pull:{products:{productId:id}}})
       
        res.redirect('/wishList')
    } catch (error) {
        console.log(error.message);
    }
}

//  Adding products to cart from the wishlist 
const addfromwishlist = async (req,res)=>{
    try {
        let id = req.body.query
        let productData = await Product.findById({_id:id});
        let userName = await User.findOne({_id:req.session.user_id});
        let cartData =await cart.findOne({userId:userName._id});
        if(cartData){
            console.log("hiiii");
            let proExit = await cartData.products.findIndex(
                (Product)=>Product.productid == id)
                if(proExit != -1){
                    await cart.updateOne({userId:req.session.user_id,"products.productid":id},{$inc:{"products.$.count":1}})
                    res.json({success:true})
                }   else{
                    await cart.findOneAndUpdate({userId:req.session.user_id},{$push:{products:{productid:id,productPrice:productData.Price}}});
                    res.json({success:true});
                }
            }else{
            console.log("hi");
            const Cart= new cart({
                    userId:userName._id,
                    userName:userName.name,
                    products:[{
                        productid:productData._id,
                        productPrice:productData.Price
                    }]
                });
                const cartData = await Cart.save();
                if(cartData){
                    res.json({success:true})
                }else{
                    res.redirect('/shop');
                }
            }
    } catch (error) {
        console.log(error.message);
    }
}

module.exports={
    wishlistLoad,
    addToWishlist,
    removeWishlist,
    addfromwishlist
}