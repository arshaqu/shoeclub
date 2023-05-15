const express = require ('express');
const adminRoute = express();
const multer = require ('multer');
const path = require ("path")
const upload =require ('../config/multer.js')




adminRoute.set('view engine','ejs')
adminRoute.set('views','./views/admin')

const productController = require('../controllers/productController')
const adminController = require('../controllers/adminController')
const cartController = require('../controllers/cartController')
const categoryController = require('../controllers/categoryController')
const couponController = require('../controllers/couponcontroller');
const bannerController = require('../controllers/bannerController');
const orderController = require ('../controllers/orderController')
const Auth = require('../middleware/adminAuth');
const { request } = require('https');


adminRoute.get('/',Auth.isLogout,adminController.loadLogin);
adminRoute.get('/dashboard',Auth.isLogin,adminController.loadDashoard);
adminRoute.get('/users',Auth.isLogin,adminController.listusers);
adminRoute.get('/logout',adminController.logout);
adminRoute.get('/block-user',Auth.isLogin,adminController.block);
adminRoute.get('/unblock-user',Auth.isLogin,adminController.unblock);
adminRoute.get('/categorylist',Auth.isLogin,categoryController.categoryList)
adminRoute.get('/addcategory',Auth.isLogin,categoryController.AddCategory);
adminRoute.get('/addproduct',Auth.isLogin,productController.AddProducts);
adminRoute.get('/addCoupon',Auth.isLogin,couponController.loadAddCoupon);
adminRoute.get('/listCoupon',Auth.isLogin,couponController.listCoupon);
adminRoute.get('/editCoupon',Auth.isLogin,couponController.loadEditProduct);
adminRoute.get('/deleteCoupon',Auth.isLogin,couponController.deleteCoupon);
adminRoute.get('/productlist',Auth.isLogin,productController.productList);
adminRoute.get('/delete-product',Auth.isLogin,productController.deleteProduct);
adminRoute.get('/edit-product',Auth.isLogin,productController.loadeditproduct);
adminRoute.get('/edit-coupon',Auth.isLogin,couponController.loadEditProduct);
adminRoute.get('/editCatogary',Auth.isLogin,categoryController.editCatogary);
adminRoute.get('/deleteCategory',Auth.isLogin,cartController.deleteCatagory);
adminRoute.get('/order',Auth.isLogin,orderController.adminShowOrder);
adminRoute.get('/viewproduct',Auth.isLogin,orderController.viewProduct);
adminRoute.get('/addBanner',Auth.isLogin,bannerController.loadAddBanner);
adminRoute.get('/listBanner',Auth.isLogin,bannerController.listBanner);
adminRoute.get('/deleteBanner',Auth.isLogin,bannerController.deleteBanner)
adminRoute.get('/editBanner',Auth.isLogin,bannerController.editBanner)
adminRoute.get('/editorder',Auth.isLogin,orderController.editOrder)
adminRoute.get('/exportOrder',Auth.isLogin,orderController.exportOrder)
adminRoute.get('/salesreport',Auth.isLogin,adminController.salesReport)
adminRoute.get('/exportOrderPDF',Auth.isLogin,orderController.exportOrderPDF);
adminRoute.get('/salesreportpdf',Auth.isLogin,orderController.salesReportPdf);


adminRoute.get('/sales',orderController.sales)







adminRoute.post('/addcategory',categoryController.insertCatrgory)
adminRoute.post('/',adminController.loginVerify);
adminRoute.post('/addproduct',upload.upload.array('Image',10),productController.insertproduct);
adminRoute.post('/editCatogary',Auth.isLogin,categoryController.saveCatogary);
adminRoute.post('/edit-product',upload.upload.array('Image',10),productController.saveproduct);
adminRoute.post('/addCoupon',couponController.postAddCoupon);
adminRoute.post('/editCoupon',couponController.postEditCoupon);
adminRoute.post('/editBanner',bannerController.SaveBanner);
adminRoute.post('/editOrder',orderController.saveEditOrder);
adminRoute.post('/addBanner',upload.upload.single('image'),bannerController.addBanner);
adminRoute.post('/sortdate',orderController.sortdate);
adminRoute.post('/removeimg',productController.removeImg)






module.exports = adminRoute


