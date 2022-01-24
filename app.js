require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const router = express.Router();
const auth = require('./src/middleware/auth')
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const Signin = require('./src/models/signin');
require('./src/db/conn');
const port = process.env.port || 3000;

const static_path = path.join(__dirname,"./public");
app.use(express.json())
app.use(bodyParser.json());
app.use(express.static(static_path));
app.use(cookieParser());
app.use(bodyParser.urlencoded({
    extended: false
}));

console.log(static_path);

app.get('/signin',auth,function(req,res){
    console.log("signin page");
    res.render("signin");
  });


app.post("/signin", async(req,res)=>{
    try{
        const email = req.body.email;
        const password = req.body.password;
        const cpassword = req.body.cpassword;
        const user = await Signin.findOne({email : email});

        if(user){
            res.status(201).send("Account already present");
        }
        
        if(password===cpassword){
            const newSignin = new Signin({
                username : req.body.username,
                email : req.body.email,
                password : password,
                cpassword : cpassword,
                consent : req.body.consent
            })


            const token = await newSignin.generateAuthToken();

            res.cookie("jwt",token,{
                expires : new Date(Date.now()+500000),
                httpOnly : true
            })

            const signin = await newSignin.save();
            res.status(201).redirect("index.html");
        }
        else{
            res.send("password is not matching");
        }
        
    }
    catch(error){
        res.status(404).send(error);
    }
})

app.post("/login", async(req,res)=>{
    try{
        
        const email = req.body.email;
        const password = req.body.password;

        const user = await Signin.findOne({email : email})
        const isMatch = await bcrypt.compare(password,user.password);
        const token = await user.generateAuthToken();

        if(isMatch){
            res.cookie("jwt",token,{
                expires : new Date(Date.now()+500000),
                httpOnly : true
            })
            res.status(201).redirect("index.html");
        }
        else{
            res.send("error");
        }

    }
    catch(error){
        let err = new Error("Email is not present")
        res.status(404).send(err);
    }
})



app.get('/',function(req,res){
    res.set({
        'Access-control-Allow-Origin': '*'
        });
    return res.redirect('index.html');
})




app.listen(port,()=>{
    console.log("server is running at port no "+port);
})