


export const validation = (schema,r_url) =>
{
    return (req, res, next) =>
    {
        const requestKeys = ['body', 'query', 'params', 'headers', 'file', 'files' , 'user']
        let validationErrors = [] 
        for (const key of requestKeys)
        {
            if (schema[key])
            {
                const validationResult = schema[key].validate(req[key], {
                    abortEarly : false
                })
                // console.log(validationResult);
                if (validationResult?.error?.details)
                {
                    // validationErrors.push(validationResult.error.details)
                    for (const err of validationResult.error.details)
                    {
                        validationErrors.push(err.path[0])
                        
                    }
                }
            }
            
        }

        if (validationErrors.length)
        {
            // return res.status(400).json({message:'Validation Error' , errors: validationErrors})
            req.flash('validationErrors', validationErrors)
            req.flash('oldData', { ...req.body, ...req.query, ...req.params})
            return res.redirect(r_url)
        }
        next()
    }
}