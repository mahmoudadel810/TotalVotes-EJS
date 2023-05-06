import userModel from "../../../DB/models/userModel.js";
import cloudinary from '../../utils/cloudinary.js';
import bcrypt from 'bcryptjs';



//-------------------------------------addProfilePicture--------------------------------
// just one profile pic at once no duplicates are allowed

export const profilePicture = async (req, res, next) =>
{
    const { _id, firstName } = req.user;

    if (!req.file)
    {
        next(new Error('You must provide Your Picture', { cause: 400 }));
    }

    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {

        folder: `profilePicture/${firstName}`
    });
    const user = await userModel.findByIdAndUpdate(_id,
        {
            profile_Pic: secure_url,
            profilePicPublicId: public_id
        });

    if (!user)
    {
        next(new Error('Please Login first ', { cause: 400 }));
    }
    const deletedData = await cloudinary.uploader.destroy(user.profilePicPublicId);//old pic addressnew:false

    console.log(deletedData);

    return res.status(201).json({ message: 'Done' });
};

//---------------------------------coverPictures------------------------------------


export const coverPictures = async (req, res, next) =>
{
    const { _id, firstName } = req.user;

    if (!req.files)
    {
        next(new Error('You must provide Your Picture', { cause: 400 }));
    }

    let images = [];
    let publicIds = [];


    for (const file of req.files)
    {
        const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {

            folder: `coverPictures/${firstName}`
        });

        images.push(secure_url);
        publicIds.push(public_id);
    }
    const user = await userModel.findByIdAndUpdate(_id,
        {
            covers: images,
            coverPublicIds: publicIds
        });

    if (!user)
    {
        next(new Error('You must Log In First', { cause: 400 }));
    }
    const data = await cloudinary.api.delete_resources(user.coverPublicIds);
    console.log(data);

    return res.status(201).json({ message: 'Done' });
};


//---------------------------------updatePassword--------------------------------

export const updatePassword = async (req, res, next) =>
{
    const { _id } = req.user;
    const { oldPassword, newPassword } = req.body;

    const user = await userModel.findById({ _id });

    if (!user)
    {
      return  next(new Error('Please Login First ', { cause: 400 }));
    }
    const match = bcrypt.compareSync(oldPassword, user.password);

    if (!match)
    {
       return next(new Error('Wrong Old Password', { cause: 400 }));
    }
    const hashedPassword = bcrypt.hashSync(newPassword, +process.env.SALT_ROUNDS);

    const updated = await userModel.findByIdAndUpdate({ _id },
        {
            password: hashedPassword
        })
    if (!updated)
    {
      return  next(new Error('Can Not Update Your Password !', { cause: 400 }));
    }
    return res.status(201).json({ message: 'Password Updated Success' , updated });
};

//---------------------------------softDelete--------------------------------

export const softDelete = async (req, res, next) =>
{
    const { _id } = req.user;

    const user = await userModel.findById({ _id });

    const deleted = await userModel.findByIdAndUpdate({ _id },
        {
            isDeleted: true
        });
};