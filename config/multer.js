const multer = require ('multer');
const path = require ("path")

const storage = multer.diskStorage({
    destination: function (req,file,cb){
        cb(null,path.join(__dirname, '../public/admin/adminImages'));
    },
    filename: function(req,file,cb){
        const name =Date.now()+'-'+file.originalname;
        cb(null,name);
    }
});
const imageFilter = function(req,file,cb){
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)){
        req.fileCalidationError = 'Only images files are allowed!';
        return cb(new Error('only image files are allowed!'),false);
    }
    cb(null, true)
}
const upload = multer({storage:storage,imageFilter})



module.exports = {
    upload,
}


