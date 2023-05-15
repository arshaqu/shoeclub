const Banner = require('../models/bannerModel');

// loading banner 
const loadAddBanner = async (req,res)=>{
    try{
        res.render('addbanner');
    }catch(error){
        console.log(error.message);
    }
}

// Adding banner
const addBanner = async (req,res)=>{
    try{
        const banner = new Banner({
            header:req.body.header,
            image:req.file.filename,
            description:req.body.description
        })
        const ban = await banner.save();
        if(ban){
            res.render('addBanner',{message:"Banner Added"});
        }else{
            res.render('addBanner',{message:"Banner add failed"});
        }
    }catch(error){
        console.log(error.message);
    }
}

// Listing Banner Page
const listBanner = async (req,res)=>{
    try{
        const bannerData = await Banner.find({});
        res.render('listBanner',{banner:bannerData});
    }catch(error){
        console.log(error.message);
    }
}

// deleting the banner 
const deleteBanner = async (req,res)=>{
    try {
        const dlt = await Banner.deleteOne({_id:req.query.id});
        console.log(dlt);
        if(dlt){ 
        res.redirect('listBanner')
        }else{
           res.redirect('listBanner')
        }
    } catch (error) {
        console.log(error.message);
    }
}

// editting the banner
const editBanner = async(req,res)=>{
    try {
        const bannerData = await Banner.findOne({_id:req.query.id});
        res.render('editBanner',{bannerData: bannerData})
    } catch (error) {
        console.log(error.message);
    }
}

// saving the banner after updating
const SaveBanner = async(req,res)=>{
    try {
        const bannerData = await Banner.findOneAndUpdate({_id:req.query.id},{$set:{image:req.file.filename,header:req.body.header,description:req.body.description}});
        res.render('editBanner',{bannerData: bannerData})
    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    addBanner,
    loadAddBanner,
    listBanner,
    deleteBanner,
    SaveBanner,
    editBanner
}