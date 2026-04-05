const mongoose = require("mongoose");


const securityQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
    },
    answer: {
        type: String,
        required: true,
    },
});

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
        },
        userName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            //mongoose schema validation for email format
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            lowercase: true,
            // Regular expression for validating email format
            match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
            trim: true,
        },
        phoneNumber: {
            type: String,
            // match: [/^[0-9]{10}$/, "Please enter a valid 10-digit phone number"], 
            match: [/^[6-9]\d{9}$/, "Enter valid Indian phone number"],
            trim: true,
        },
        profileImage: String,
        dateOfBirth: Date,
        gender: String, // Male, Female, Other
        maritalStatus: String,
        nationality: String,
        // address: {
        //     street: String,
        //     city: String,
        //     state: String,
        //     country: String,
        //     postalCode: String,
        // },
        //multiple addresses for each user
        addresses: [
            {
                type: String, // Home, Office
                street: String,
                city: String,
                state: String,
                country: String,
                postalCode: String,
            }
        ],
        documents: {
            aadhaarNumber: String,
            aadhaarFrontUrl: String,
            aadhaarBackUrl: String,
            panNumber: String,
            panCardUrl: String,
        },
        occupation: String,
        companyName: String,
        salary: Number,
        experienceYears: Number,
        bankDetails: {
            accountHolderName: String,
            accountNumber: String,
            ifscCode: String,
            bankName: String,
        },
        role: {
            type: String,
            enum: ["ADMIN", "EMPLOYEE", "USER"],
            default: "USER"
        },
        isVerified: Boolean,
        isBlocked: Boolean,
        lastLogin: Date,
        loginAttempts: Number,
        language: String,
        theme: String, // dark/light
        notificationsEnabled: Boolean,
        age:{
            type: Number,
            required:true
        },
        createdAt: Date,
        updatedAt: Date,
        // creditScore: Number,
        // loanHistory: [
        //     {
        //         loanAmount: Number,
        //         status: String,
        //         emi: Number,
        //     }
        // ],
        securityQuestion: {
            type: [securityQuestionSchema],
            //why we use type because we want to store multiple security questions and answers for each user,
            // so we use an array of securityQuestionSchema to allow for multiple entries.
            // Each entry in the array will contain a question and its corresponding answer, providing flexibility for users to have more than one security question for account recovery or verification purposes.
            //so here for type indicates array 
            validate: {
                validator: function (value) {
                    if (!Array.isArray(value)) return false; // ✅ safety

                    const questions = value.map((q) => q.question);
                    return new Set(questions).size === questions.length;
                },
                message: "Security questions must be unique",
            }
            
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("UserDashboard", userSchema);


//if we say select = false in schema then it will not include this field in the response