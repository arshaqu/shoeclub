const express = require("express");
const userRoute = express();
const session =require("express-session");
const Auth =require("../middleware/Auth")

const config = require("../config/confiq")
userRoute.set('view engine','ejs')
userRoute.set('views','./views/users');

const userController = require("../controllers/userController");
const cartController =require ("../controllers/cartController");
const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController')
const wishlistController = require ('../controllers/wishlistController');
const addressController = require ('../controllers/addressController');
const orderController = require ('../controllers/orderController');
const couponController = require('../controllers/couponcontroller');



userRoute.get('/verification',userController.loadVerfication);
userRoute.get('/shop',Auth.isLogin,Auth.blocked,userController.loadShop);
userRoute.get('/register',Auth.isLogout,userController.loadRegister);
userRoute.get('/',Auth.isLogout,userController.loginload);
userRoute.get('/login',Auth.isLogout,userController.loginload);
userRoute.get('/home',Auth.isLogin,Auth.blocked,userController.loadHome);
userRoute.get('/showProduct',Auth.isLogin,Auth.blocked,productController.loadShowProduct);
userRoute.get('/logout',userController.userLogout);
userRoute.get('/cart',Auth.isLogin,Auth.blocked,cartController.loadCart);
userRoute.get('/forget',Auth.isLogout,userController.forgetLoad);
userRoute.get('/forget_verifiy',userController.forget_verifiy);
userRoute.get('/page',Auth.isLogin,Auth.blocked,userController.loadShop);
userRoute.get('/wishlist',Auth.isLogin,wishlistController.wishlistLoad);
userRoute.get('/profile',Auth.isLogin,userController.loadProfile);
userRoute.get('/checkout',Auth.isLogin,cartController.loadcheckout);
userRoute.get('/addAddress',Auth.isLogin,addressController.addAddress);
userRoute.get('/removeAddres',Auth.isLogin,addressController.removeAddress);
userRoute.get('/removeWish',Auth.isLogin,wishlistController.removeWishlist);
userRoute.get('/orderSuccess',Auth.isLogin,orderController.orderSucces);
userRoute.get('/showOrder',orderController.showOrder)
userRoute.get('/editAddres',Auth.isLogin,addressController.editAddress);
userRoute.get('/showorderproducts',orderController.vieworderProducts)


userRoute.post('/login',userController.verifyLogin);
userRoute.post('/',userController.verifyLogin);
userRoute.post('/register',userController.insertUser);
userRoute.post('/applyCoupon',couponController.applyCoupon);
userRoute.post('/verification',userController.verifyLoad);
userRoute.post('/addtocart',Auth.isLogin,userController.addtocart);
userRoute.post('/forget',userController.forgetVerify)
userRoute.post('/forget_verifiy',userController.change_pass)
userRoute.post('/addToWishlist',Auth.isLogin,wishlistController.addToWishlist);
userRoute.post('/addfromwishlist',wishlistController.addfromwishlist)
userRoute.post('/shop',userController.loadShop);
userRoute.post('/checkout',productController.placeOrder);
userRoute.post('/addAddress',addressController.insertAddress);
userRoute.post('/pricefilter',productController.filterProduct);
userRoute.post('/profile',Auth.isLogin,userController.saveProfile);
userRoute.post('/changeProductQuantity',Auth.isLogin,cartController.changeProductCount);
userRoute.post('/editAddres',Auth.isLogin,addressController.saveAddress);
userRoute.post('/cancelorder',Auth.isLogin,orderController.cancelOrder);
userRoute.post('/removeAddres',addressController.removeAddress)
userRoute.post('/verifyPayment',productController.verifyPayment);







module.exports = userRoute;