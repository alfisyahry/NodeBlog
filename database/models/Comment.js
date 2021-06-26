const  mongoose  = require("mongoose");
const  Schema  =  mongoose.Schema,
ObjectId = Schema.ObjectId;
const  Comments = new Schema({
    comment :String,    
    postId :String
});
module.exports = mongoose.model('Comments', Comments);
