const Product = require ('../models/productModel');
const Category = require('../models/categoryModel');
const uc = require('upper-case');
const toastr = require('toastr')

//  Listing the catagory
const categoryList = async (req,res)=>{
    try {
        const CatData = await Category.find({});
        res.render('categoryList',{Category:CatData});
    } catch (error) {
        console.log(error.message);
    }
}

//  updating and saving the catagory 
const  saveCatogary= async (req,res)=>{
    try {
        const name = req.body.categoryName;
       const catDATA = await Category.findOneAndUpdate({_id:req.query.id},{$set:{categoryName:name}});
       if(catDATA){
        res.redirect('categorylist')
        // toastr.success('Have fun storming the castle!', 'Miracle Max Says')
       }
    } catch (error) {
        console.log(error.message);
    }
}

//  Adding the catagory
const insertCatrgory = async (req,res)=>{
    try
    
     {
        if(req.session.admin_id){
            const catName = uc.upperCase(req.body.categoryName);
             const category = new Category({
                categoryName:catName
            })
            if(catName.trim().length==0){
                res.render('AddCategory',{message:"Invalid typing"});
            }else{
                const catData = await Category.findOne({categoryName:catName});
            
                if(catData){
                    res.render('AddCategory',{message:"This category is already exist"});
                }else{
                    const categoryData = await category.save();
                    if(categoryData){
                        res.redirect('/admin/addcategory');
                    }else{
                        res.redirect('/admin/dashboard');
                    }
                }
            }
        }else{
            res.redirect('/admin')
        }
    } catch (error) {
        console.log(error.message);
    }
 }

//  creating the catagory Page
 const AddCategory = async (req,res)=>{
    try {
       res.render('AddCategory')
    }
     catch (error) {
        console.log(error.message);
    }
}

//  Editing the catagory 
const  editCatogary= async (req,res)=>{
    try {
        const id = req.query.id;
       const catDATA = await Category.findById({_id:id});
       res.render('editCatogary',{Catogary:catDATA})
    } catch (error) {
        console.log(error.message);
    }
}



module.exports={
    categoryList,
    saveCatogary,
    insertCatrgory,
    AddCategory, 
    editCatogary
}