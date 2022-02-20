//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require('lodash');
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const session = require('express-session')//level 5 : Session and cookies and passport auth
const passport = require('passport')
let GoogleStrategy = require('passport-google-oauth20').Strategy;
let findOrCreate = require("mongoose-findorcreate") //making the OAuth docs more than just psuedo code

const mongoose = require('mongoose');
require('dotenv').config();      
// mongoose.connect('mongodb+srv://'+process.env.username+':'+process.env.password+'@cluster0.tl0pg.mongodb.net/blogPostsDB?retryWrites=true&w=majority'

mongoose.connect('mongodb://localhost:27017/blogPosts'
, {
  useNewUrlParser: true
});


const postsSchema = {
  title: String,
  body: Object ,
  thumbimg : String,
  realimg : String,
  date : String,
  readingTime:String
}

const Post = mongoose.model(
  "Post", postsSchema
)


const userSchema = new mongoose.Schema({
  email : String ,
  password: String,
  googleId:String
});

const User = mongoose.model(
  "User" , userSchema
)
userSchema.plugin(findOrCreate)
app.use(session({
  secret: process.env.secret,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: true }
}))


app.use(passport.initialize());
app.use(passport.session());

let specificUserId
// use static serialize and deserialize of model for passport session support
passport.serializeUser(function(user, done) {
  console.log(
    'in serialize'
  )
    specificUserId = user._id
    done(null, user._id);
    console.log('after done ' , specificUserId)
 
});


passport.deserializeUser(function(id, done) {
  console.log("inside deserialize")

  User.findById(id, function(err, user) {
    console.log("user "+ user)
    done(err, user);
  });
});


passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/compose"
},
function(accessToken, refreshToken, profile, cb) {
  User.findOneAndUpdate({ googleId: profile.id }, function (err, user) {
    return cb(err, user);
  });
}
));


const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = ". Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";


// let titlePost = "";
// let bodyPost = "";
// let arrOfPosts = [];

app.get("/" , (req,res)=>{

  Post.find((err, rows) => {

    if(err) console.log(err)

    else{
      res.render("home.ejs" , {

         homeStartingContent: homeStartingContent,
         arrOfPosts: rows

      })
    }
  })


});

// app.get('/signup' , (req , res) => {
//   res.render("signup")
// })
// app.get('/auth/google',
//   passport.authenticate('google', { scope: ['profile'] }));

// app.get('/auth/google/compose', 
//   passport.authenticate('google', { failureRedirect: '/' }),
//   function(req, res) {
//     console.log("authenticated should go ot compose")
//     // Successful authentication, redirect.
//      res.redirect("/compose")
//   });


app.get("/about" , (req,res) =>{
  res.render("about.ejs" , {
     aboutContent: aboutContent
  })
});


app.get("/contact" , (req,res) =>{
  res.render("contact.ejs" , {
     contactContent: contactContent
  })
});

// app.get("/compose" , (req,res)=>{
//   console.log(specificUserId)
//   if(specificUserId !== undefined){
//     User.findById(specificUserId, (err) =>{
   
//       if(! err){
//         res.render("compose")
//       }
//       else{
//             console.log(err)
//       res.redirect("/")
//       }
//     })
//   }
  
// else{
//   res.redirect("/signup")
// }

 

// })

app.get("/compose" , (req,res)=>{
  res.render('compose.ejs')
})

app.get("/posts/:topic" , (req , res)=>{

  // console.log(arrOfPosts)
  // console.log(req.params.topic)
  let param = req.params.topic;

  // let searchedForPost ;
  // let matchFoundFlag = false;
  Post.findOne({_id: param} , (err , foundPost) => {
    if(err) console.log(err)

    else{
      // if(_.kebabCase(foundPost.title.toLowerCase()) === _.kebabCase(param.toLowerCase())){

        // matchFoundFlag = true;
        console.log("Match was found.")
        // console.log("This is the obj ")
        // console.log(searchedForPost)


        res.render("post.ejs" , {
          titlee: foundPost.title,
          bodyy: foundPost.body,
        
          realimgg: foundPost.realimg,
          datee: foundPost.date
        })

      }
    // }
  })
  // for(let post of arrOfPosts){
  //
  //     searchedForPost = post
  //
  //   if(_.kebabCase(post.title.toLowerCase()) === _.kebabCase(param.toLowerCase())){
  //
  //     matchFoundFlag = true;
  //     console.log("Match was found.")
  //     // console.log("This is the obj ")
  //     // console.log(searchedForPost)
  //
  //
  //     res.render("post.ejs" , {
  //       titlee: searchedForPost.title,
  //       bodyy: searchedForPost.body
  //     })
  //
  //   }
    //
    // }

    // if(!matchFoundFlag){
    //   console.log("No match was found.")
    // }

  })








app.post("/" , (req,res)=>{

  const post = new Post({
    title : req.body.titlePost,
    body : req.body.bodyPost,
    thumbimg: req.body.thumbimgg,
    realimg : req.body.realimgg,
    date:req.body.datee,
    readingTime:req.body.readingTimee

  });
  post.save();

  // arrOfPosts.push(post)

  res.redirect("/")
})

app.listen( process.env.PORT|| 3000, function() {
  console.log("Server started on port 3000");
});
