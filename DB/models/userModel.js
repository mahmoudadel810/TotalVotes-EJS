import { Schema, model, } from "mongoose";
import bcrypt from 'bcryptjs';
import { systemRoles } from '../../src/utils/systemRoles.js';

const userSchema = new Schema({
    id: {
        type: Number,
        unique: true
    },
    firstName: String,
    lastName: String,

    email: {
        type: String,
        unique: true
    },

    password: String,
    gender: {
        type: String,
        enum: ['male', 'female']
    },

    profile_Pic: String,

    profilePicPublicId : String,

    isConfirmed: {
        type: Boolean,
        default: false
    },
    isLoggedIn: {
        type: Boolean,
        default: false
    }, 
    covers: [String],
    coverPublicIds: [String], 
    role: {
        type: String,
        default: systemRoles.USER,
        enum: [systemRoles.USER, systemRoles.ADMIN, systemRoles.SUPER_ADMIN]
    }

}, {
    timestamps: true
});

//hooks

userSchema.pre('save', function (next, doc) //hooks فانكشن بتتنفذ قبل حاجه معينه
{
    this.password = bcrypt.hashSync(this.password, +process.env.SALT_ROUNDS);
    next();
});

//Avoid Drop Collection
const userModel = model.User || model('User', userSchema);


export default userModel;

