//تستخدمها مثلا في العرض بتعرض مثلا اول خمسه بالترتيب وعلي نظام صفحات يتم العرض والتحكم فيها


export const pagination = ({ page = 1, size = 5 } = {}) =>
{
    if (page <= 0) page = 1;
    if (size <= 0) size = 1;

    const limit = size;
    const skip = (page - 1) * parseInt( size);
    const nextPage = parseInt(page) + 1;
    const prevPage = parseInt(page) - 1;
    const currentPage = parseInt(page)


    return {
        limit,
        skip,
        nextPage,
        prevPage, 
        currentPage
    };

};