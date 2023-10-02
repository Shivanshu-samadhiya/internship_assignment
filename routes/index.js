var express = require('express');
var router = express.Router();
const userModel = require('./users');
const MemberModel = require('./members');
const communityModel = require('./comunity');
const passport = require("passport");
const fs = require("fs");
const path = require("path");
const multer  = require('multer');

const localStragety = require('passport-local');
const members = require('./members');
const comunity = require('./comunity');
passport.use(new localStragety(userModel.authenticate()))

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueSuffix)
  }
})
const upload = multer({ storage: storage })




/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('register');
});

router.get('/login', function (req, res, next) {
  res.render('login');
});

router.get('/profile', isLoggedIn, function (req, res, next) {
  userModel.findOne({username: req.session.passport.user})
  .populate("community")
      .then(function (foundUser) {
      console.log(foundUser);
      res.render("profile", { foundUser: foundUser })
    })  
});

router.post('/register',function(req,res,next){
  userModel.findOne({username:req.body.username})
  .then(function (foundUser) {
    if (foundUser) {
      res.send("email already exists");
    }
    else {
      var newuser = new userModel({
        username: req.body.username,
        age: req.body.age,
        image: req.body.image,
        email: req.body.email
      })
      userModel.register(newuser, req.body.password)
        .then(function (u) {
          console.log(u);
          passport.authenticate('local')(req, res, function () {
            res.redirect('/profile');
          })
        })
        .catch(function (e) {
          res.send(e);
        })

    }
  })
})

router.post('/createcommunity',isLoggedIn,upload.single("postimage"),function(req,res,next){
    userModel.findOne({ username: req.session.passport.user })
    .then(function (foundUser) {
        if(foundUser.role === "Community Member")
          {
            foundUser.role = "Community Admin" 
          }
          communityModel.create({
            userid: foundUser._id,
            communityName: req.body.community,
           Slug: req.body.Slug,
            postimage:req.file.filename
          })
          .then(function (createcommunity) {
            foundUser.community.push(createcommunity._id);
            foundUser.save()
            .then(function(){
           res.redirect("back")
       })
   })
  })
})

// multer code for profile image
router.post('/upload',isLoggedIn, upload.single("image"),function (req, res, next) {
  // upload ho chuki hai data req.file mein hai
    userModel.findOne({ username:req.session.passport.user })
    .then(function(foundUser){
     if (foundUser.image !== 'def.png') {
       fs.unlinkSync(`./public/images/uploads/${foundUser.image}`);
     }
     foundUser.image = req.file.filename;
     foundUser.save()
     .then(function(){
      res.redirect("back")
     })
    });
});

 router.get('/mycommunity',isLoggedIn,isAdmin,function(req,res,next){
  userModel.findOne({ username: req.session.passport.user })
    .then(function(founduser){
       communityModel.findOne({comunity:req.body.userid})
         .then(function(communitydata){
          console.log(communitydata);
          res.render("community",{communitydata:communitydata})
         })
    })
  })

router.get('/addmember',isLoggedIn,isAdmin,function(req,res,next){
  userModel.find()
    .then(function(alluser){
      console.log(alluser)
      res.render("member",{alluser})
    })   
})
router.get('/addcommunity/:memberid',isLoggedIn,isAdmin,function(req,res,next){
  userModel.findOne({ username:req.session.passport.user})
 .then(function(foundUser){
   userModel.findOne({_id:req.params.memberid})
   .then(function(memb){
    console.log(memb);
   })
 })
  })

router.get('/feed',isLoggedIn,function(req,res,next){
  userModel.findOne({ username: req.session.passport.user })
  .then(function(founduser){
     communityModel.find()
       .then(function(data){
        console.log(data);
        res.render("feed",{data:data})
       })
  })
})

 function isAdmin(req,res,next){
  userModel.findOne({username: req.session.passport.user })
  .then(function (foundUser) {
      if(foundUser.role === "Community Admin") return next();
      else {
        res.redirect("back")
      }
  })}
router.get('/check/:email', function (req, res, next) {
  userModel.findOne({email:req.params.email})
  .then(function(user){
    if(user){
      res.json(true)
    }
    else{
      res.json(false)
    }
  })
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/profile',
  failureRedirect: '/login'
}), function (req, res, next) {

});

router.get('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect('/login')
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  else {
    res.redirect('/login')
  }
}



module.exports = router;
