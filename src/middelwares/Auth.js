import userModel from "../../DB/models/userModel.js";
import { asyncHandler } from "../utils/errorHandling.js";
import { tokenDecode } from "../utils/tokenFunction.js";

const authFunction = async (req, res, next) =>
{
    
    if (!req?.session?.user?._id)
    {   //signed In ?
        req.flash('authError', 'Session Expired , please log in again');
        return res.redirect('/ejs/auth/getLogin')
    }
    const user = await userModel.findById(req.session.user._id)
    if (!user)
    {
        req.flash('signUpError', 'Please signUp');
       return res.redirect('/ejs/auth/getSignUp')
    }
    req.user = user;
    next();
};

export const auth = () =>
{
    return asyncHandler(authFunction);
};

//-----------------------------------authorization--------------------------------


export const authorization = (accessRoles) =>
{
    return (req, res, next) =>
    {

        const { role } = req.user;

        console.log(
            {
                role,
                accessRoles
            }
        );

        if (!accessRoles.includes(role))
        {
            // return next(new Error('unauthorized', { status: 401 }));
            req.flash('signUpError', 'Unauthorized Access !!');
            return res.redirect('/ejs/auth/getSignUp');
        }
        next();

    };
};