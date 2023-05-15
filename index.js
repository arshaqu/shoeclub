const dotenv = require('dotenv')
dotenv.config();
const mongoose = require ('mongoose');
mongoose.connect(process.env.MONGO); 
const session = require ('express-session');
const config = require ('./config/confiq');

//----------------------------------------------------

const express = require("express")
const app = express();

const bodyParser =require("body-parser")

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static("public/users"));
app.use(express.static("public/admin"));
app.use(session({
   secret:config.session,
   saveUninitialized:true,
   resave:false
}))

app.use((req, res, next) => {
   res.header(
     "Cache-Control",
     "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
   );
   next();
});

const userRoute = require('./routes/userRoute');
app.use('/',userRoute);

const adminRoute = require('./routes/adminRoute');
app.use('/admin',adminRoute);

app.listen(process.env.PASS,function(){
   console.log("Server started on http://localhost:3000");
}); 