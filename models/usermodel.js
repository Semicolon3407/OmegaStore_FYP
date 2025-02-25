const mongoose = require('mongoose'); // Make sure mongoose is required
const bcrypt = require('bcryptjs');

// User Schema
const userSchema = new mongoose.Schema({
    firstname: { 
        type: String, 
        required: [true, "First name is required"],
        trim: true
    },
    lastname: { 
        type: String, 
        required: [true, "Last name is required"],
        trim: true
    },
    email: { 
        type: String, 
        required: [true, "Email is required"], 
        unique: true, 
        lowercase: true,
        validate: {
            validator: function (v) {
                return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: "Please enter a valid email"
        }
    },
    mobile: { 
        type: String, 
        required: [true, "Mobile number is required"], 
        unique: true,
        validate: {
            validator: function (v) {
                return /^\d{10}$/.test(v); // Validates 10 digit numbers
            },
            message: "Please enter a valid mobile number"
        }
    },
    password: { 
        type: String, 
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters long"]
    },
    role: {
        type: String,
        default: 'user' // Default role for new users
    },
    isBlocked: { 
        type: Boolean, 
        default: false
    },
    cart: { 
        type: Array, 
        default: [] 
    },
    address: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Address" 
    }],
    wishlist: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Product" 
    }],
    refreshToken:{
        type: String,
        
    }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
userSchema.methods.isPasswordMatched = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
