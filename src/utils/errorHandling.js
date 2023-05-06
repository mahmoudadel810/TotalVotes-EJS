let stackVar;
export const asyncHandler = (API) =>
{
    return (req, res, next) =>
    {
        API(req, res, next).catch((err) =>
        { 
            console.log(err);
            if (err.code == 11000)
            {
                return next(new Error('Email Already Exist', { cause: 409 }));
            }
            stackVar = err.stack;
            console.log({ err: err.message ,});
            return next(new Error(err.stackVar));
        });
    };
};

export { stackVar };
