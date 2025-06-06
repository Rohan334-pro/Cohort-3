require('dotenv').config();
 const JWT_ADMIN_PASSWORD =process.env.JWT_ADMIN_PASSWORD
 const {Router} = require ("express");
 const jwt = require ("jsonwebtoken");
 const adminRouter = Router();
 const { adminModel,courseModel} = require("../db");
 const { adminMiddleware } = require("../middleware/admin");
 const bcrypt = require('bcrypt');
 adminRouter.post('/signup',async(req,res) =>{ 
     
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

      
       await adminModel.create({
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



adminRouter.post('/signin',async(req,res) =>{
  const {email,password} = req.body;

  const admin = await adminModel.findOne({
    email:email
  })
 
  if (!admin) {
          return res.status(403).json({
              msg: "User not found"
          })
      };
      const isPasswordValid = await bcrypt.compare(password, admin.password)
      if (!isPasswordValid) {
          return res.status(403).json({
              msg: "Invalid password"
          })
      }

  if(admin){
   const token =jwt.sign({
    id: admin._id
   },JWT_ADMIN_PASSWORD);
    res.json ({
        token,
        message: "You are loged in"
    })
  }else
    res.status(403).json({
        message:"wrong creadentials"
    })
});

adminRouter.post("/course",adminMiddleware,async function(req,res) {
    const adminId = req.userId
    
     const {title,description,imageUrl,price} = req.body;

     const course = await courseModel.create({
        title:title,
        description:description,
        imageUrl:imageUrl,
        price:price,
        creatorId:adminId
     })
     res.json({
        mesaage:"course Created",
        courseId: course._id

    })
});


adminRouter.put("/course",adminMiddleware, async function(req,res) {
   const adminId = req.userId;

   const { title, description, imageUrl, price, courseId } = req.body;

    const course = await courseModel.updateOne({
        _id: courseId, 
        creatorId: adminId 
    }, {
        title: title, 
        description: description, 
        imageUrl: imageUrl, 
        price: price
    })

    res.json({
        message: "Course updated",
        courseId: course._id
    })
});

adminRouter.get("/course/bulk",adminMiddleware ,async function(req,res) {
     const adminId = req.userId;

    const courses = await courseModel.find({
        creatorId: adminId 
    });

    res.json({
        message: "Course updated",
        courses
    })
});

module.exports ={
    adminRouter:adminRouter,
    
}