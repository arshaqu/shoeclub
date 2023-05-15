 const User = require ('../models/userModel.js');
 const Address = require ('../models/adressModel.js');

 //Adding Address in the checkput page....
 const addAddress = async(req,res)=>{
    try {
        const userName = await User.findOne({_id:req.session.user_id})
        if(req.session.user_id){
            res.render('address',{userName});
        }else{
            res.redirect('/');
        }
    } catch (error) {
        console.log(error.message);
    }
 }

//Inserting the address in checkout page
 const insertAddress = async (req,res)=>{
    try {
        const userData = await User.findOne({_id:req.session.user_id});
        const addressDetails = await Address.findOne({userId:req.session.user_id});
       if(addressDetails){
        const updateOne = await Address.updateOne({userId:req.session.user_id},{$push:{addresses:{
            userName:req.body.userName,
            mobile:req.body.mobile,
            alternativeMob:req.body.alternativeMob,
            address:req.body.address,
            city:req.body.city,
            state:req.body.state,
            pincode:req.body.pincode,
            landmark:req.body.landmark }}});
            if(updateOne){
                res.redirect('/checkout')
            }else{
                res.redirect('/checkout');
            }
       }else{
        const address = new Address({
            userId:req.session.user_id,
            addresses:[{
                userName:req.body.userName,
                mobile:req.body.mobile,
                alternativeMob:req.body.alternativeMob,
                address:req.body.address,
                city:req.body.city,
                state:req.body.state,
                pincode:req.body.pincode,
                landmark:req.body.landmark
            }]
        })      
        const addressData = await address.save();
        if(addressData){
        res.redirect('/checkout');
    }else{
        res.redirect('/checkout');

    }
}
    } catch (error) {
        console.log(error.message);
    }
 }

//removing address while clicking remove button in checkout page
 const removeAddress = async (req,res)=>{
    try {
        const id = req.query.id;
        await Address.updateOne({userId:req.session.user_id},{$pull:{addresses:{_id:req.query.id}}});
        res.redirect('/checkout');
    } catch (error) {
        console.log(error.message);
    }
 }


//    Editing Address in Checkout page 
 const editAddress = async(req,res)=>{
    try {
        const addressdata = await Address.findOne({userId:req.session.user_id},{addresses:{$elemMatch:{_id:req.query.id}}});
        const address = addressdata.addresses;
        res.render('editAddres',{address:address})
    } catch (error) {
        console.log(error.message);
    }
 }
  
//  Saving address in checkout page after editing
 const saveAddress = async(req,res)=>{
    try {
        const address = await Address.updateOne({userId:req.session.user_id},{$pull:{addresses:{_id:req.query.id}}});
        const pushaddress = await Address.updateOne({userId:req.session.user_id},{$push:{addresses:{userName:req.body.userName,mobile:req.body.mobile,alternativeMob:req.body.alternativeMob,address:req.body.address,city:req.body.city,state:req.body.state,pincode:req.body.pincode,landmark:req.body.landmark}}})
        res.redirect('/checkout')
    } catch (error) {
        console.log(error.message);
    }
 }

 module.exports = {
    addAddress,
    insertAddress,
    removeAddress,
    editAddress,
    saveAddress
 }