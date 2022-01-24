const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const signinSchema = new mongoose.Schema({

    username : {
        type : String,
        required : true,
        unique : true
    },
    email : {
        type:String,
        required : true,
        unique : true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Envalid Email");
            }
        }
    },
    password : {
        type : String,
        required : true
    },
    cpassword : {
        type : String,
        required : true
    },
    consent : {
        type : String,
        default : "off",
        required : true
    },
    tokens : [{
        token : {
            type : String,
            required : true
        }
    }]

})

signinSchema.methods.generateAuthToken = async function(){
    try{
        const token = jwt.sign({_id:this._id.toString()},process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({token:token});
        await this.save();
        return token;
    }
    catch(error){
        res.send(error);
    }
}

signinSchema.pre("save",async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password,10);
        this.cpassword = await bcrypt.hash(this.cpassword,10);
    }

    next();
})

const Signin = new mongoose.model("Signin",signinSchema);
module.exports = Signin;