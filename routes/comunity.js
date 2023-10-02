const mongoose=require('mongoose');

var communitySchema= mongoose.Schema({
  userid:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"user"
  },
  postimage:{
    type:String
},
  communityName:String,
  Slug:String,
  date:{
    type:Date,
    default:Date.now()
  },
  members :[
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
      }
  ]

});
module.exports=mongoose.model("community",communitySchema);