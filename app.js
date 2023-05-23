//jshint esversion:6
const express = require("express")
const mongoose = require("mongoose")
const bodyParser = require("body-parser")
const ejs = require("ejs")
const session = require("express-session")
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")
require('dotenv').config()
app = express()

app.use(express.static("public"))
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({
    extended: true
}))



app.use(session({
    secret:"key",
    resave:false,
    saveUninitialized:false
}))

app.use(passport.initialize())
app.use(passport.session())
// mongoose.connect("mongodb://localhost:27017/userDB3",{useNewUrlParser:true});
mongoose.connect(`${process.env.URL}`,{useNewUrlParser:true})
const userSchema = mongoose.Schema({
    email: String,
    password: String
})
userSchema.plugin(passportLocalMongoose);
const User = mongoose.model("User",userSchema);

passport.use(User.createStrategy())
passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, {
        id: user.id,
        username: user.username,
        picture: user.picture
      });
    });
  });
  
  passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, user);
    });
  });

app.get('/',function(req,res){
    res.render('home')
})

app.get('/register',function(req,res){
    res.render('register')
})

app.post('/register',function(req,res){
    User.register({username:req.body.username}, req.body.password, function(err, user) {
        if (err) { 
            console.log(err);
            return res.redirect("/register")
        }
        passport.authenticate("local")(req,res,function(){
            return res.redirect("/secrets");
        })       
    });
})

app.get('/login',function(req,res){
    res.render('login')
})

app.get('/secrets',function(req,res){
    if(req.isAuthenticated()){
        res.render('secrets')
    }
    else{
        res.redirect('/login')
    }
})



app.listen(3000,function(){
    console.log("Server connected on port 3000.")
})
