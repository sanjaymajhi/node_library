var jwt=require("jsonwebtoken");

module.exports=(req,res,next)=>{
    const token=req.header("token");
    if(!token){
        return res.status(401).redirect("/users/");
    }
    try{
        const decoded=jwt.verify(token,"sanjay")
        req.user_detail=decoded.user;
        if(req.user_detail.admin){
            req.user_logged=0;
        }
        else{
            req.user_logged=1;
        }
        next();
    }
    catch{
        return res.status(500).redirect("/users/")
    }
}