const user = require('../models/User');
const bcrypt = require('bcrypt');



// Create a new user
const createUser = async (req, res) => {
    try {
        // await user.updateMany({}, { isActive: true });
        const { firstName, lastName, userName, email, phoneNumber, profileImage, dateOfBirth, gender, maritalStatus, nationality, addresses, password,age, confirmPassword, secretQuestion1, secretAnswer, secretQuestion2, secretAnswer2, secretQuestion3, secretAnswer3,isActive } = req.body;


        if (!firstName || !email || !password || !confirmPassword || !secretQuestion1 || !secretAnswer || !secretQuestion2 || !secretAnswer2 || !secretQuestion3 || !secretAnswer3) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        // Phone validation
        if (phoneNumber && !/^[6-9]\d{9}$/.test(phoneNumber)) {
            return res.status(400).json({ message: "Invalid phone number" });
        }
     

        const existingUser = await user.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const hashedAnswer = await bcrypt.hash(secretAnswer, 10);
        const hashedAnswer2 = await bcrypt.hash(secretAnswer2, 10);
        const hashedAnswer3 = await bcrypt.hash(secretAnswer3, 10);
      
        // ✅ Prepare array
        const securityQuestions = [
            { question: secretQuestion1, answer: hashedAnswer },
            { question: secretQuestion2, answer: hashedAnswer2 },
            { question: secretQuestion3, answer: hashedAnswer3 }
        ];
       
        const newUser = await user.create({
            firstName,
            lastName,
            email,
            userName,
            age:Number(req.body.age),
            password: hashedPassword,
            securityQuestions,userName,
             phoneNumber,
             profileImage,
            dateOfBirth,
            gender,
            maritalStatus,
            nationality,
            addresses,
            isActive: true
        });
        res.status(201).json({
            message: "User created successfully",
            user: newUser,
        });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({
            error: "Internal server error",
            message:  error.message,
         });
    }

};
// exports.filterSenior = (req, res, next) => {
//   // 🔥 ensure req.query exists
//   if (!req.query || typeof req.query !== "object") {
//     req.query = {};
//   }

//   // 🔥 ensure age is safe
//   if (
//     !req.query.age ||
//     typeof req.query.age !== "object" ||
//     req.query.age === null
//   ) {
//     req.query.age = {};
//   }

//   // 🔥 apply filter
//   if (!req.query.age?.$gt) {
//     req.query.age.$gt = 60;
//   }

//   console.log("sen", req.query);
//   next();
// };
//this is done by me from chatgpt
// const getAllUsers = async (req, res) => {
//     try {
//         // 1️⃣ Build query object
//         let queryObj = {};

//         for (const field in req.queryObj) {
//             // If the field is an object (e.g., age[gt]=36), convert to MongoDB operator
//             if (typeof req.queryObj[field] === "object") {
//                 queryObj[field] = {};
//                 for (const op in req.queryObj[field]) {
//                     // Convert value to number if it's numeric
//                     // const value = isNaN(req.queryObj[field][op])
//                     //     ? req.query[field][op]
//                     //     : Number(req.queryObj[field][op]);
//                     queryObj[field][`$${op}`] = req.queryObj[field][op]; // convert gt → $gt
//                     // queryObj[field][`$${op}`] = value;
//                 }
//             } else {
//                 // Normal string field filter
//                 queryObj[field] = req.query[field];
//             }
//         }
// console.log(req.query,)
//         // 2️⃣ Initialize Mongoose query
//         let query = user.find(queryObj);

//         // 3️⃣ Sorting
//         if (req.query.sort) {
//             const sortBy = req.query.sort.split(",").join(" ");
//             query = query.sort(sortBy);
//         }

//         // 4️⃣ Field selection
//         if (req.query.fields) {
//             const fields = req.query.fields.split(",").join(" ");
//             query = query.select(fields);
//         } else {
//             query = query.select("-__v"); // exclude __v by default
//         }

//         // 5️⃣ Pagination
//         if (req.query.page && req.query.limit) {
//             const page = parseInt(req.query.page, 10);
//             const limit = parseInt(req.query.limit, 10);
//             const skip = (page - 1) * limit;

//             const totalDocs = await user.countDocuments(queryObj);
//             if (skip >= totalDocs) {
//                 return res.status(400).json({ message: "Invalid page number" });
//             }

//             query = query.skip(skip).limit(limit);
//         }

//         // 6️⃣ Execute query
//         const users = await query;
//         const total = await user.countDocuments(queryObj);

//         // 7️⃣ Send response
//         res.status(200).json({
//             total,
//             results: users.length,
//             users
//         });

//     } catch (error) {
//         res.status(500).json({
//             message: "Error fetching users",
//             error: error.message
//         });
//     }
// };
//this is copy from arun na
const getAllUsers = async (req, res) => {
    // let query = User.find();
    // const count = await User.countDocuments();

    //Filtering
    // console.log("arun", req.query);
    const excludedFields = ["sort", "page", "limit", "fields"];
    let queryObj = {};
    for (const field in req.query) {
        if (excludedFields.includes(field)) continue;
        if (
            typeof req.query[field] === "object" &&
            !Array.isArray(req.query[field])
        ) {
            queryObj[field] = {};
            console.log(queryObj);
            for (const op in req.query[field]) {
                queryObj[field][`$${op}`] = Number(req.query[field][op]);
            }
        } else {
            queryObj[field] = req.query[field];
        }
        // console.log(queryObj[field]);
    }
    // console.log("arun 2", queryObj);
    let query = user.find(queryObj);
    const filteredCount = await user.countDocuments(queryObj);

    // res.json(userList);
    // console.log(req.query);

    // 🔃 Sorting
    if (req.query.sort) {
        const sortKey = req.query.sort.split(",").join(" ");
        query = query.sort(sortKey);
    } else {
        query = query.sort("-createdAt");
    }

    // 🎯 Field selection
    if (req.query.fields) {
        const showFields = req.query.fields.split(",").join(" ");
        query = query.select(showFields);
    } else {
        query = query.select("-__v");
    }

    // 📄 Pagination
    if (req.query.page && req.query.limit) {
        const page = req.query.page * 1;
        const limit = req.query.limit * 1;

        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit);

        if (filteredCount <= skip) {
            return res.status(200).json({
                message: "Invalid page number",
            });
        }
    }

    const users = await query;
    // const totalUsers = await user.countDocuments();  --for all document
    res.json({ users, total: filteredCount });
};

//this is copy from system
// const getAllUsers = async (req, res) => {
//     console.log(req.query,"query");
//     try {
//         // const users = await user.find().sort({ createdAt: -1 })
        
//         const count = await user.countDocuments(); //total number of users in database
//         let queryObj = {}; 
//         //?age[gt]=5
//         for (const field in req.query) {
//             console.log(typeof (req.query[field]), "typeOf(req.query[field]")
         
//             if (typeof (req.query[field]) === "Object") {
//                 queryObj[field] = {};
//                 for (const op in req.query[field])
//            queryObj[field][`$${op}`] = Number(req.query[field][op])
                
//             }
//             else {
//                 queryObj[field]=req.query[field]
//             }
//         }

//         const userSort =  user.find(queryObj)
       
       
//         if (req.query.sort) {
//             const sortKey = req.query.sort.split(",").join(" ");
//             console.log(sortKey);
//             userSort = userSort.sort(sortKey);
//         }

//         if (req.query.fields) {
//             const showFields = req.query.fields.split(",").join(" ");
//             userSort = userSort.select(showFields);//if we want to show only specific fields in response then we can use select method and pass the fields we want to show in response
//             //userSort.select means from 
//         } else {
//            userSort = userSort.select("-__v");//if we dont want to show some fields in response then we can use select method and pass the fields we want to exclude in response with - sign, here we are excluding __v field from response as it is not required in response
//         }


//         if (req.query.page && req.query.limit) {
//             const page = req.query.page * 1;// req.query.page will change as string 
//             const limit = req.query.limit * 1;

//             const skip = (page - 1) * limit;
//             userSort = userSort.skip(skip).limit(limit);

//             if (count <= skip) {
//                 return res.status(200).json({
//                     message: "Invalid page number",
//                 });
//             }
//         }


        

//         const users = await userSort; // Execute the query after applying sorting and field selection
//         // const total = await users.countDocuments();

//         res.status(200).json({
//             // total,
//             results: users.length,
//              users
//         });
//         // res.json(users);

//     } catch (error) {
//         res.status(500).json({
//             message: "Error fetching users",
//             error: error.message,
//         });
//     }
// };

//here instead of delete user we will update the user by setting isActive to false, so that we can keep the user data in database for future reference and also we can reactivate the user if needed
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;  
        const updatedUser = await user.findByIdAndUpdate(
            id,
            { isActive: false },//always inactive
            { new: true }
        );          
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({
            message: "User updated successfully",
            user: updatedUser
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName } = req.body;

        const updatedUser = await user.findByIdAndUpdate(
            id,
            { firstName, lastName }, // ✅ only update these
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            message: "User updated successfully",
            user: updatedUser
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
module.exports = {
    createUser,
    getAllUsers,
     updateUser,
    deleteUser,
    // setAgeFilter
}



// users,----in getallusers---------------------
// dont use users in response as it contains sensitive information like password and secret answers
//so we can send only the required fields in response


//this is big work so we avoid safeUsers method too
// const safeUsers = users.map((u) => ({
//     id: u._id,
//     firstName: u.firstName,
//     lastName: u.lastName,
//     email: u.email,
//     age: u.age,
//     isActive: u.isActive,
//     createdAt: u.createdAt
// }));

  //sort by age,fname if both age are same we will use firstname to sort the users,\
    //  if we want to sort in descending order then we can use -age or -firstName in query parameter, 
    // if we want to sort by multiple fields then we can use comma separated values in query parameter like age
    // ,firstName or -age,-firstName

    
    
    //createUser
    
            //         // ✅ Create user by save()
        //         const newUser = new User({
        //             password,
        //             securityQuestions,
        //         });

        //         await newUser.save();


        // Create a new user instance---it will include password and secret answers in plain text which is a security risk, so we will hash the password and secret answers before storing them in database---so i use newuser


        //never store plain password in database as it is a security risk, always hash the password before storing it in database
        //never store confirm password in database as it is only used for validation purpose and it is not required to be stored in database
        // Always hash using bcrypt
        // ✅ Always validate before hashing
        // ✅ Always remove sensitive data from response
