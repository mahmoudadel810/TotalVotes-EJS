
import multer from 'multer'

export const validation_Object = {
    image: ['image/png','image/jpeg'],
    file: ['application/pdf']
};

export const myMulter = ({
    customValidation = validation_Object.image
}) =>
{
    const storage = multer.diskStorage({});

    const fileFilter = (req, file, cb) =>
    {
        if (!customValidation.includes(file.mimetype))
        {
            return cb(new Error('in- valid file extension', { status: 400 }, false));
        }
        cb(null, true);
    };
    const upload = multer({ fileFilter, storage })
    return upload
};