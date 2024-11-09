import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

dotenv.config();

const emailRegexPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegexPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/; // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character

const adminSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, "Please Enter Your Email"],
            validate: {
                validator: function (value) {
                    return emailRegexPattern.test(value);
                },
                message: "Please Enter a Valid Email",
            },
            unique: true,
        },
        password: {
            type: String,
            required: [true, "Please Enter a Strong Password"],
            validate: {
                validator: function (value) {
                    return passwordRegexPattern.test(value);
                },
                message:
                    "Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character",
            },
        },
    },
    { timestamps: true }
);

adminSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;
