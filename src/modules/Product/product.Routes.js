import { Router } from 'express';
import { asyncHandler } from '../../utils/errorHandling.js';
// import { validation } from '../../middelwares/validation.js';
import * as controller from './product.Controller.js';
import { auth, authorization } from '../../middelwares/Auth.js';
import { myMulter } from '../../services/Multer.js';
import { endPoints } from './product.endPoint.js';
const router = Router();


router.post('/addProduct', auth(),/* myMulter({}).array('pics', 2) */ asyncHandler(controller.addProduct));
router.get('/getProductsWithComments', auth(), asyncHandler(controller.getProductsWithComments));
router.get('/getAllProducts', auth(), asyncHandler(controller.getAllProducts));

router.put('/likeProduct/:productId', auth(), asyncHandler(controller.likeProduct));
router.put('/unlikeProduct/:productId', auth(), asyncHandler(controller.unlikeProduct));
router.patch('/softDelete', auth(), authorization(endPoints.SOFT_DELETE), asyncHandler(controller.softDelete));

router.delete('/deleteProduct/:productId' , auth() , asyncHandler(controller.deleteProduct))



export default router;