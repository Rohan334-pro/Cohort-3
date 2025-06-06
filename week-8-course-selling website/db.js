
const mongoose = require("mongoose")
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;


const userSchema = new Schema ({
    firstName: String,
    lastName : String ,
    password : String,
    email    : { type:String, unique:true}

});

const courseSchema = new Schema({
    title: String,
    description:String,
    price: Number,
    imageUrl:String,
    creatorId:ObjectId

});


const adminSchema = new Schema ({
    firstName: String,
    lastName : String,
    password : String,
    email    : String

});

const purchaseSchema = new Schema ({
    courseId : ObjectId,
    userId:ObjectId
});

const userModel = mongoose.model("user",userSchema);
const adminModel = mongoose.model("admin",adminSchema);
const courseModel = mongoose.model("course",courseSchema);
const purchaseModel = mongoose.model("purchase",purchaseSchema);

module.exports = {
 userModel,
 adminModel,
 courseModel,
 purchaseModel
}