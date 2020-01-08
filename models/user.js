var mongoose=require("mongoose");

var Schema=mongoose.Schema;

var userSchema=new Schema({
    name:{type:String,min:2,required:true},
    email:{type:String,required:true},
    mobile:{type:Number,required:true},
    password:{type:String,required:true},
    books_borrowed:[{type:Schema.Types.ObjectId,ref:"BookInstance"}],
    admin:{type:Boolean}
});

userSchema.virtual("url").get(()=>{
    return "/users/"+this._id;
})

module.exports=mongoose.model("User",userSchema);