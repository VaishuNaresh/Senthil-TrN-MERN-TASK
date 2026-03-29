const user = require('../models/User');
const bcrypt = require('bcrypt');

// Create a new user
const createUser = async (req, res) => {
    try {
        // await user.updateMany({}, { isActive: true });
        const { firstName, lastName, email, password,age, confirmPassword, secretQuestion1, secretAnswer, secretQuestion2, secretAnswer2, secretQuestion3, secretAnswer3,isActive } = req.body;

        if (!firstName || !email || !password || !confirmPassword || !secretQuestion1 || !secretAnswer || !secretQuestion2 || !secretAnswer2 || !secretQuestion3 || !secretAnswer3) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }
     
        // Create a new user instance---it will include password and secret answers in plain text which is a security risk, so we will hash the password and secret answers before storing them in database---so i use newuser
        // const newUser = new user({
        //     firstName,
        //     lastName,
        //     email,
        //     password,
        //     secretQuestion1,
        //     secretAnswer,
        //     secretQuestion2,
        //     secretAnswer2,
        //     secretQuestion3,
        //     secretAnswer3
        // });
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

   
        //             password,
        //             confirmPassword,
        //             q1, a1,
        //             q2, a2,
        //             q3, a3
        //         } = req.body;


        //         // ✅ Prepare array
        //         const securityQuestions = [
        //             { question: q1, answer: a1 },
        //             { question: q2, answer: a2 },
        //             { question: q3, answer: a3 },
        //         ];

        //         // ✅ Create user
        //         const newUser = new User({
        //             password,
        //             securityQuestions,
        //         });

        //         await newUser.save();

        const newUser = await user.create({
            firstName,
            lastName,
            email,
            age,
            password: hashedPassword,
            //never store plain password in database as it is a security risk, always hash the password before storing it in database
            //never store confirm password in database as it is only used for validation purpose and it is not required to be stored in database
            // Always hash using bcrypt
// ✅ Always validate before hashing
// ✅ Always remove sensitive data from response
            securityQuestions 
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

const getAllUsers = async (req, res) => {
    console.log(req.query,"query");

    //sort by age,fname
    try {
        const users = await user.find().sort({ createdAt: -1 })
        let userSort = await user.find()
        const count = await user.countDocuments(); //total number of users in database
        
        if (req.query.sort) {
            const sortKey = req.query.sort.split(",").join(" ");
            console.log(sortKey);
            userSort = userSort.sort(sortKey);
        }
        // if (req.query.fields) {
            // const showFields = req.query.fields.split(",").join(" ");//✅ convert comma-separated fields to space-separated for Mongoose
            // userSort = userSort.select(showFields);//✅ include only requested fields
        // } else {
            // userSort = userSort.select("-__v"); //✅ exclude internal fields like __v
        // }

            // users,
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
        
        if(req.query.page && req.query.limit){
            const page= req.query.page * 1;
            const limit = req.query.limit * 1;
            const skip = (page - 1) * limit;
            userSort = userSort.skip(skip).limit(limit);

            res.status(200).json({
                message: "Users fetched successfully",
                users: userSort
            });
        }
        
        res.status(200).json({
            message: "Users fetched successfully",
            users: users,
            count:count
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching users",
            error: error.message,
        });
    }
};

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
    deleteUser
}