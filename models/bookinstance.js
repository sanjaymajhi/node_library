var mongoose=require("mongoose");
var moment=require("moment");

var Schema=mongoose.Schema;

var bookinstanceSchema=new Schema({
    book:{type:Schema.Types.ObjectId,required:true,ref:"Book"},
    imprint:{type:String,required:true},
    status:{type:String,required:true,enum:["Maintenance","Available","Loaned","Reserved"],default:"Maintenance"},
    due_back:{type:Date,default:Date.now},
    borrowed_by:{type:Schema.Types.ObjectId,ref:"User"}
});

bookinstanceSchema.virtual("url").get(function(){
    return "/catalog/bookinstance/"+this._id;
});

bookinstanceSchema.virtual("due_back_formatted").get(function(){
    return moment(this.due_back).format("YYYY-MM-DD");
});

module.exports=mongoose.model("BookInstance",bookinstanceSchema);
