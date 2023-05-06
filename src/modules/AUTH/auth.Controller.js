import { render, renderFile } from 'ejs';
import userModel from '../../../DB/models/userModel.js';
import { sendEmail } from '../../services/sendEmail.js';
import { tokenDecode, tokenGeneration } from '../../utils/tokenFunction.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cloudinary from '../../utils/cloudinary.js';

//–––––––––––––––––––––––––––––––––––––––getSignUp–––––––––––––––––––––––––––––––––––-–––––––––––––––––––––––
//render for signUp
export const getSignUp = (req, res, next) =>
{

    res.render('signup.ejs', {
        pageTitle: "Registeritaion",
        emailError: req.flash('emailError')[0], //0 to get only message
        oldData: req.flash('oldData')[0],
        tokenError: req.flash('tokenError')[0],
        sendEmail: req.flash('sendEmail')[0],
        signUpError: req.flash('signUpError')[0],
        validationErrors: req.flash('validationErrors')[0]



    });
};


//–––––––––––––––––––––––––––––––––––––signUP––––––––––––––––––––––––––––––––––––––––––––––––––––––––

export const signUp = async (req, res, next) =>
{
    const { firstName, lastName, email, password, confirmPassword, gender } = req.body;

    const userCheck = await userModel.findOne({ email }).select("_id email");
    if (userCheck)
    {
        // req.flash('emailError') //getter don't log after flash will be ZERO
        req.flash('emailError', 'Email already Exist !!'); //setter //keyMust be unique
        req.flash('oldData', req.body);
        // return next(new Error('Email Already Exist', { status: 409 }));
        return res.redirect('/ejs/auth/getSignUp');
    }

    const newUser = new userModel({
        firstName, lastName, email, password, gender, confirmPassword
    });
    newUser.isConfirmed = false;

    const token = tokenGeneration({ payload: { newUser } });    // const token = jwt.sign({newUser}, process.env.TOKEN_KEY);

    // console.log({ token });
    if (!token)
    {
        // return next(new Error('Token Generation Fail', { status: 400 }));
        req.flash('tokenError', 'token Generation Failed !!'); //setter //keyMust be unique
        req.flash('oldData', req.body);
        return res.redirect('/ejs/auth/getSignUp');
    }
    const confirmationLink = `${req.protocol}://${req.headers.host}${process.env.BASE_URL}/auth/confirmLink/${token}`;

    console.log({ confirmationLink });

    const message = `<a href = ${confirmationLink}> Click To Confirm </a>`;

    const mailed = await sendEmail({
        to: email,
        message,
        subject: 'Confirmation Email '
    });
    if (!mailed)
    {
        // return next(new Error('Fail While Sending Email !! ', { status: 500 }));
        req.flash('sendEmail', 'Fail Sending Email To User!!'); //setter //keyMust be unique
        req.flash('oldData', req.body);
        return res.redirect('/ejs/auth/getSignUp');
    }

    // res.status(201).json({ message: 'Sign Up Done ! please Now Confirm Your Email' });
    res.redirect('/ejs/auth/getConfirm');
};
//================================renderConfirmPage================================
export const getConfirm = (req, res, next) =>
{
    res.render('confirm.ejs', {
        pageTitle: "Confirmation"
    });
};


//–––––––––––––––––––––––––––––––––––––––confirmationLink–––––––––––––––––––––––––––––––––

export const confirmationLink = async (req, res, next) =>
{
    console.log("dfafafdf");
    const { token } = req.params;
    console.log({ token });
    const decode = tokenDecode({ payload: token });
    // const decode = jwt.verify(token, process.env.TOKEN_KEY);

    console.log(decode);

    if (!decode?.newUser)
    {
        return next(new Error('token decode failed !', { status: 400 }));
    }
    decode.newUser.isConfirmed = true;

    const confirmedUser = new userModel({ ...decode.newUser });
    await confirmedUser.save();
    // res.status(200).json({message: 'Confirmed Done' , decode})
    res.redirect('/ejs/auth/getlogin');
};
//==============================getLogin========================================================

export const getLogin = (req, res, next) =>
{
    return res.render('login.ejs', {
        pageTitle: "Login",
        passwordError: req.flash('passwordError')[0],
        loginError: req.flash('loginError')[0],
        emailError: req.flash('emailError')[0], //0 to get only message
        authError: req.flash('authError')[0],
        sst : req.session.destroy() //this line delete the hole session fromDB , not refreshble

    });
};

//–––––––––––––––––––––––––––––––––––––Login–––––––––––––––––––––––––––––––––––––––––––––––––––––––

export const Login = async (req, res, next) =>
{
    const { email, password } = req.body;

    const user = await userModel.findOne({ email, isConfirmed: true });

    if (!user)
    {
        // return next(new Error('Please Enter Valid Email', { status: 400 }));
        req.flash('emailError', 'Pleasy Try Again !!');
        req.flash('oldData', req.body);
        return res.redirect('/ejs/auth/getLogin');
    }
    const match = bcrypt.compareSync(password, user.password);

    if (!match)
    {
        // return next(new Error('In-Valid Login Information', { status: 400 }));
        req.flash('passwordError', 'Pleasy Try Again!!');
        req.flash('oldData', req.body);
        return res.redirect('/ejs/auth/getLogin');

    }
    // const token = tokenGeneration({ payload: { _id: user._id, email: user.email, isLoggedIn: true } });
    //instead token we use Session 
    req.session.user = { _id: user._id, email: user.email, isLoggedIn: true };

    const loggedIn = await userModel.findOneAndUpdate({ _id: user._id }, { isLoggedIn: true });

    if (!loggedIn)
    {
        // return next(new Error('Please Login Again', { status: 500 }));
        req.flash('loginError', 'Pleasy Try Again  !!');
        req.flash('oldData', req.body);
        return res.redirect('/ejs/auth/getLogin');
    }
    // res.status(201).json({ message: 'Login Success' });
    res.redirect('/ejs/auth/getProfile');
};
//====================================getProfile===========================================
export const getProfile = (req, res) =>
{
    res.render('profile.ejs', {
        pageTitle: 'Profile',
        user: req.user,
        fileError: req.flash('fileError')[0],
    });
};
//====================================uploadProfile===========================================

export const uploadProfile = async (req, res) =>
{
    if (!req.file)
    {
        req.flash('fileError', 'Pleasy select Your Picture  !!');
        return res.redirect('/ejs/auth/getProfile');
    }
    const { _id } = req.user;
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
        folder: `profiles/${_id}`
    });
    const user = await userModel.findOneAndUpdate({ _id }, {
        profile_Pic: secure_url,
        profilePicPublicId: public_id
    });
    const deletedData = await cloudinary.uploader.destroy(user.profilePicPublicId);
    // console.log(deletedData);
    if (!user)
    {
        req.flash('loginError', 'Pleasy Try Again  !!');
        return res.redirect('/ejs/auth/getLogin');
    }
    return res.redirect('/ejs/auth/getProfile');
};
//=======================================logOut====================================

export const logOut = (req, res, next) =>
{

    req.session.destroy();
    return res.redirect('/ejs/auth/getLogin');

};




















// export const testApi = (req, res, next) =>
// {
//     return res.render('test.ejs', {
//         pageTitle: 'Ejs Testing',
//         name : ''
//    })
// };

// export const testApi2 = (req, res, next) =>
// {
//     return res.render('test.ejs', {
//         pageTitle: 'Ejs Testing', 
//         name : 'Dola'
//     });
// };


