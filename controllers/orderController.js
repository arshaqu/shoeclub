const Product = require ('../models/productModel');
const Category = require('../models/categoryModel.js')
const User = require('../models/userModel');
const Order = require('../models/orderModel');
const session = require('express-session');
const { status } = require('init');
const exceljs = require('exceljs');
const puppeteer=require("puppeteer");
const path = require('path');


// Order Succes Page Loading
const orderSucces = async (req,res)=>{
    try {
        res.render('orderSuccess')
    } catch (error) {
        console.log(error.message);
    }
}
//   Showing the Orders 
const showOrder = async(req,res)=>{
    try {
        const userName = await User.findOne({_id:req.session.user_id});
        const orderData = await Order.find({userId:req.session.user_id}).populate("products.productid","deliveryAddress");
        if(req.session.user_id){
            res.render('showorder',{userName,orderData:orderData})
        }else{
            res.redirect('/');
        }
    } catch (error) {
        console.log(error.message);
    }
}

//  Viewing The Order of the Product
const vieworderProducts = async (req,res)=>{
 try {
    const userName = await User.findOne({_id:req.session.user_id});
 const orderid = await Order.findOne({_id:req.query.id}).populate("products.productid")
 const products = orderid.products;
 if(req.session.user_id){
   if(session.length>0){
    res.render('showorderProducts',{userName,orderid,products});
   }else{
    res.render('showorderProducts',{userName,orderid,products,message:"Order Cancelled... ,No more orders here."})
   }
   }else{
    res.redirect('/')
 }
 } catch (error) {
    console.log(error.message);
 }
}

//  In Admin side Showing the Orders 
const adminShowOrder = async (req,res)=>{
    try {
        const orderData = await Order.find({})
        res.render('orderList',{orderData}) 
    } catch (error) {
        console.log(error.message);
    }
}
//  viewing the Products Ordered 
 const viewProduct = async (req,res)=>{
    try {   
        const orderId = req.query.id
        const orderData = await Order.findOne({_id:orderId}).populate('products.productid');
        const productData = orderData.products;
        res.render('viewProducts',{productData,orderData})
    } catch (error) {
        console.log(error.message);
    }
 }

//   Editing The Order 
 const editOrder = async (req,res)=>{
    try {
        const orderId =req.query.id;
         const orderData = await Order.findOne({_id:orderId});
         res.render('editOrder',{orderData})
    } catch (error) {
        console.log(error.message);
    }
 }

//  Saving the Order after editing 
   const saveEditOrder = async (req,res)=>{
    try {
        const orderId = req.query.id;
        const status = req.query.status
        const update = await Order.updateOne({_id:req.query.id},{$set:{status:req.body.status}});
        console.log(status);
        if(update){
            res.redirect('/admin/order')
        }else{
            res.render('editOrder',{message:"Status Not Updated"});
        }
    } catch (error) {
        console.log(error.message);
    }
   }

//  Cancelling the Order
const cancelOrder = async (req,res)=>{
    try{
        const user = req.session.user_id;
        const orderid = req.body.orderid;
        const orderData = await Order.findOne({_id:orderid});
        const userData = await User.findOne({_id:user});
        const userWallet = userData.wallet;
        if(orderData.status == "placed" || orderData.status == "Deliverd"){
            if(orderData.paymentMethod == "onlinePayment"){
                const totalWallet = orderData.Amount+userWallet
                console.log(totalWallet);
                await User.updateOne({_id:req.session.user_id},{$set:{wallet:totalWallet}});
                await Order.findByIdAndUpdate({_id:orderid},{$set:{status:"Cancelled"}});
                res.json({success:true})
               }else{
                const totalWallet = userWallet+orderData.orderWallet;
                await Order.findByIdAndUpdate({_id:orderid},{$set:{status:"Cancelled"}});
                await User.updateOne({_id:req.session.user_id},{$set:{wallet:totalWallet}});
                res.json({success:true});
               }
        }else{
            await Order.findByIdAndUpdate({_id:orderid},{$set:{status:"Cancelled"}});
            res.json({success:true});
        }
    }catch(error){
        console.log(error.message);
    }
}
 
//  Exporting The Order details 
const exportOrder = async (req,res)=>{
    try{
        const workbook = new exceljs.Workbook()
        const worksheet = workbook.addWorksheet("Orders");
        worksheet.columns = [
            { header:"S no.",key:"s_no" },
            { header:"User",key:"userName" },
            { header:"Payment Method",key:"paymentMethod" },
            { header:"Products",key:"products" },
            { header:"Amount Paid",key:"totalAmount" },
            { header:"Total Amount",key:"Amount" },
            { header:"Date",key:"date" },
            { header:"Status",key:"status" }
        ]
        let counter = 1;
        const orderData = await Order.find({});
        orderData.forEach((order)=>{
            order.s_no = counter;
            worksheet.addRow(order);
            counter++;
        })

        worksheet.getRow(1).eachCell((cell)=>{
            cell.font = { bold:true };
        })

        res.setHeader("Content-Type","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        res.setHeader("Content-Disposition",`attachment;filename=order.xlsx`)

        return workbook.xlsx.write(res).then(()=>{
            res.status(200);
        })

    }catch(error){
        console.log(error.message);
    }
}

//  Expoting the Order for downloading in Pdf 
 const exportOrderPDF = async (req,res)=>{
    try {
        const browser = await puppeteer.launch()
        const page = await browser.newPage()
        await page.goto(`http://localhost:3000/admin/sales` , {
        waitUntil:"networkidle2"
        })
        await page.setViewport({width: 1680 , height: 1050})
        const todayDate = new Date()
        const pdfn = await page.pdf({
            path: `${path.join(__dirname,'../public/files', todayDate.getTime()+".pdf")}`,
            format: "A4"
        })

        await browser.close()
    
        const pdfUrl = path.join(__dirname,'../public/files', todayDate.getTime()+".pdf")

        res.set({
            "Content-Type":"application/pdf",
            "Content-Length":pdfn.length
        })
        res.sendFile(pdfUrl)
    } catch (error) {
        console.log(error.message);
    }
 }
  
//  loading the sales Page 
 const sales = async (req,res)=>{
    try {
        const orderData = await Order.find({});
        res.render('htmltopdf',{orderData})
    } catch (error) {
        console.log(error.message);
    }
}
 
// Sales report downloading in Pdf 
const salesReportPdf = async (req,res)=>{
    try {
      
        const browser = await puppeteer.launch()
        const page = await browser.newPage()
        await page.goto(`http://localhost:3000/admin/sales` , {
        waitUntil:"networkidle2"
        })
        await page.setViewport({width: 1680 , height: 1050})
        const todayDate = new Date()
        const pdfn = await page.pdf({
            path: `${path.join(__dirname,'../public/file', todayDate.getTime()+".pdf")}`,
            format: "A4"
        })

        await browser.close()
    
        const pdfUrl = path.join(__dirname,'../public/file', todayDate.getTime()+".pdf")

        res.set({
            "Content-Type":"application/pdf",
            "Content-Length":pdfn.length
        })
        res.sendFile(pdfUrl)
    } catch (error) {
      console.log(error.message);
    }
   }
//  Soting the sales report as per date 
   const sortdate = async (req, res) => {
    try {
      const from = req.body.from;
      const to = req.body.to;
      orderData = await Order
        .find({ status: { $ne: "CANCELED" }, date: { $gt: from, $lte: to } })
        .sort({ date: -1 });
      res.render("salesreport", { orderData });
    } catch (error) {
      console.log(error);
    }
  };
 
module.exports = {
    cancelOrder,
    orderSucces,
    showOrder,
    vieworderProducts,
    adminShowOrder,
    viewProduct,
    editOrder,
    saveEditOrder,
    exportOrder,
    exportOrderPDF,
    sales,
    sortdate,
    salesReportPdf
}