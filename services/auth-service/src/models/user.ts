import mongoose, { Document } from "mongoose";

// Extending Document to get all the default properties of a Mongoose document
export interface IUser extends Document { 
    name?: string; // Real name (optional)
    username?: string; // Unique username for classic login
    email?: string;
    password?: string;
    googleId?: string;
    image?: string;
    isVerified: boolean;
}

const UserSchema = new mongoose.Schema<IUser>({
    name: {
        type: String,
    },
    username: {
        type: String,
        unique: true,
        sparse: true 
    },
    email: {
        type: String,
        unique: true,
        sparse: true 
    },
    password: {
        type: String, // Optional because OAuth / Email OTP users don't have passwords
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    image: {
        type: String
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const User = mongoose.model<IUser>("User", UserSchema);

export default User;