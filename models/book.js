var mongoose=require("mongoose");
var Schema=mongoose.Schema;
var bookSchema=new Schema({
    title:{type:String,required:true},
    author:{type:Schema.Types.ObjectId,ref:"Author",required:true},
    genre:[{type:Schema.Types.ObjectId,ref:"Genre"}],
    summary:{type:String,required:true},
    isbn:{type:String,required:true}
});

bookSchema.virtual("url").get(function(){
    return "/catalog/book/"+this._id;
})

module.exports=mongoose.model("Book",bookSchema);