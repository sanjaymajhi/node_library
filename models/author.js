var mongoose=require("mongoose");
var moment=require("moment");

var schema=mongoose.Schema;

var authorSchema=new schema({
    first_name:{type:String,required:true,max:100},
    family_name:{type:String,required:true,max:100},
    date_of_birth:{type:Date},
    date_of_death:{type:Date}
});

authorSchema.virtual("name").get(function(){
    return this.first_name+" "+this.family_name;
});

authorSchema.virtual("lifespan").get(function(){
    return moment(this.date_of_birth).format("YYYY")+"-"+moment(this.date_of_death).format("YYYY");
});

authorSchema.virtual("dob").get(function(){
    return moment(this.date_of_birth).format("YYYY-MM-DD");
});

authorSchema.virtual("dod").get(function(){
    return moment(this.date_of_death).format("YYYY-MM-DD");
});

authorSchema.virtual("url").get(function(){
    return "/catalog/author/"+this._id;
});

module.exports=mongoose.model("Author",authorSchema);
