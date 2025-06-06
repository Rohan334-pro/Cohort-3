require('dotenv').config();
const JWT_USER_PASSWORD = process.env.JWT_USER_PASSWORD;
const { Router } = require("express");
const {userModel ,courseModel,purchaseModel} = require("../db");
const jwt = require ("jsonwebtoken");
const userRouter =Router();
const { userMiddleware } = require("../middleware/user");
const z = require ('zod');
const bcrypt = require('bcrypt');

userRouter.post('/signup',async(req,res) =>{
   const {email,password,firstName,lastName} = req.body
   
      const reqBody = z.object({
       email:z.string().email().min(5).max(25),
      password: z.string().min(3).max(10).regex(
           /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_\-+=<>?/{}[\]~])/,
           "Password must contain at least one uppercase letter, one lowercase letter, and one special character"),
       firstName:z.string().min(3).max(20),
       lastName:z.string().min(3).max(20),
    });
    
    const parsebodywithSucess = reqBody.safeParse(req.body)
       if(!parsebodywithSucess.success){
        res.status(403).json ({
            message: parsebodywithSucess.error
        })
        return
       };

       const hashPassword = await bcrypt.hash(password,10);
       try{

      
       await userModel.create({
        email:email,
        password:hashPassword,
        firstName:firstName,
        lastName:lastName
       })
        }catch(e){
            console.log("Error: ",e)
        }
    res.json({
        message:"You are signed up"
    })
});



userRouter.post('/signin',async(req,res) =>{
  const {email,password} = req.body;

  const user = await userModel.findOne({
    email:email
  })
  if (!user) {
        return res.status(403).json({
            msg: "User not found"
        })
    };
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
        return res.status(403).json({
            msg: "Invalid password"
        })
    }

  if(user){
   const token =jwt.sign({
    id: user._id
   },JWT_USER_PASSWORD);
    res.json ({
        token,
        message: "You are loged in"
    })
  }else
    res.status(403).json({
        message:"wrong creadentials"
    })
});

userRouter.get("/purchases", userMiddleware, async function(req, res) {
    const userId = req.userId;

    const purchases = await purchaseModel.find({
        userId,
    });

    let purchasedCourseIds = [];

    for (let i = 0; i<purchases.length;i++){ 
        purchasedCourseIds.push(purchases[i].courseId)
    }

    const coursesData = await courseModel.find({
        _id: { $in: purchasedCourseIds }
    })

    res.json({
        purchases,
        coursesData
    })
});

module.exports = {
    userRouter : userRouter
}