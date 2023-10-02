var mongoose = require('mongoose');
var passportLocalMongoose= require("passport-local-mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/sassplatform");

var userSchema = mongoose.Schema({
 username:String,
 password:String,
 age:Number,
 email:String,
 image:{
   type:String,
   default:"def.png"
  }, 
userid: [
    {type: mongoose.Schema.Types.ObjectId, ref: "community"}
  ],
community: [
  {type: mongoose.Schema.Types.ObjectId, ref: "community"}
],
role:{
  type:String,
  default:"Community Member"
}

})


userSchema.plugin(passportLocalMongoose,{ username : 'email' });

module.exports = mongoose.model('user',userSchema);