import { model, Schema, } from 'mongoose';


// Declare the Schema of the Mongo model
const productSchema = new Schema({

    title: String,
    caption: String,
    // Images: [{
    //     type: String,
    //     required: true
    // }],
    // puplic_id: [{
    //     type: String,
    //     required: true
    // }],
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    unlikes: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    comments: {
        type: Schema.Types.ObjectId,
        ref: 'Comment'   //parent child relationship
    },
    totalVotes: {
        type: Number,

    },
    isDeleted: {
        type: Boolean,
        default: false
    }
},
    {
        timestamps: true
    });





//hooks 

productSchema.post('findOnAndUpdate', async function ()
{
    const { _id } = this.getQuery();
    console.log({ data: this.getQuery(), id: _id });

    const product = await this.model.findOne({ _id });
    console.log(product);

    product.totalVotes = product.likes.length - product.unlikes.length;
    product.__v = product.__v + 1;
    await product.save();




});


const productModel = model.product || model('Product', productSchema);

export default productModel;



