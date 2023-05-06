import cloudinary from '../../utils/cloudinary.js';
import productModel from '../../../DB/models/productModel.js';
import { pagination } from '../../services/pagination.js';








export const addProduct = async (req, res, next) =>
{
    const { title, caption } = req.body;
    const { _id, firstName } = req.user;
    // if (!req.files.length)
    // {
    //     return next(new Error('Please Select Your Images', { cause: 400 }));
    // }
    // let imageArr = [];
    // let publicIdsArr = [];
    // for (const file of req.files)
    // {
    //     const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
    //         folder: `products/${firstName}`
    //     });

    //     imageArr.push(secure_url);
    //     publicIdsArr.push(public_id);
    // }
    const product = new productModel({
        title, caption,
        // Images: imageArr,
        // puplic_id: publicIdsArr,
        createdBy: _id

    });
    const savedProduct = await product.save();

    if (savedProduct)
    {
        return res.status(201).json({ message: 'Product Added Success', savedProduct });
    }
    return res.status(401).json({ message: 'Can Not Add Your Product Please Try again Later ' });

}; 

//______________________________________getProductsWithComments_________________________________
//childParent Method
export const getProductsWithComments = async (req, res, next) =>
{
    // const { _id } = req.user;
    // const products = await productModel.find({});

    // let arr = []
    // for (const product of products)
    // {
    //     const comments = await commentModel.find({ productId: product._id }).populate([
    //         {path : "commentBy",
    //         select : "email " }

    //     ])
    //     arr.push({ product , comments });
    // }
    // if (!products)
    // {
    //     return res.status(401).json({ message: 'Can Not Find Your Product Please Try again Later' });
    // }
    // return res.status(200).json({ message: 'Products Found', arr });
    //------------------------------------------------------------------------------------------------

    //##Parent Child Method
   
    const products = await productModel.find({}).populate([
        {
            path: 'comments',
            populate: [{
                path: 'commentBy',
                select: 'firstName',
            }],
            match: {
                commentBody: 'samsung'
            }
        },
        {
            path: 'createdBy',
        }
    ])

    if (!products.length)
    {
        res.status(404).json({ message: 'Product not found' });
    }
    res.status(201).json({ message: 'here is All  ', products });
};

//______________________________________getAllProducts_________________________________

export const getAllProducts = async (req, res, next) =>
{
    const { page, size } = req.query;
    const { limit, skip } = pagination({ page, size });

    const products = await productModel.find({}).populate([
        {
            path: 'comments',
            populate: [{
                path: 'commentBy',
                select: 'firstName',
            }],
            match: {
                commentBody: 'samsung'
            }
        },
        {
            path: 'createdBy',
        }
    ]).limit(limit).skip(skip);

    if (!products.length)
    {
        res.status(404).json({ message: 'Product not found' });
    }
    res.status(201).json({ message: 'here is All  ', products });
};


//-------------------------------likeProduct---------------------------------------------------------

export const likeProduct = async (req, res, next) =>
{
    const { _id } = req.user;
    const { productId } = req.params;

    const product = await productModel.findOneAndUpdate({ _id: productId, unlikes: { $ne: _id } },
        {
            $addToSet: { //بديل للبوش ولكن لا يتم اضافتها مرتان للداتا بيز ||$push
                likes: _id
            }
        }, {
        new: true
    });

    if (!product)
    {
        return next(new Error('Product not found', { cause: 400 }));
    }

    res.status(201).json({ message: 'Product Liked', product });
};

//-------------------------------unlikeProduct-----------------------------------------------------

export const unlikeProduct = async (req, res, next) =>
{
    const { _id } = req.user;
    const { productId } = req.params;

    const product = await productModel.findOneAndUpdate({ _id: productId, likes: { $ne: _id } },
        {
            $addToSet: {
                unlikes: _id
            }
        }, {
        new: true
    });
    if (!product)
    {
        return next(new Error('Product not found', { cause: 400 }));
    }
    res.status(201).json({ message: 'Product Unliked', product });
};

//-------------------------------------softDelete----------------------------------------------------


export const softDelete = async (req, res, next) =>
{
    // const { _id } = req.user;
    const { productId } = req.body;

    const product = await productModel.findOneAndUpdate({ productId  , isDeleted : false},
        {
            $set: {
                isDeleted: true
            }
        }, {
        new: true
    });
    if (!product)
    {
        return next(new Error('Product not found or Already Deleted', { cause: 400 }));
    }
    res.status(201).json({ message: 'Product soft deleted', product });
};


//-------------------------------------deleteProduct----------------------------------------------------


export const deleteProduct = async (req, res, next) =>
{
    const { productId } = req.params;
    const {_id} = req.user

    const product = await productModel.findOneAndDelete(productId );

    if (!product)
    {
        return next(new Error('Product not found' , {cause}));
    }
    res.status(204).json({ message: 'Product deleted' , product });
};