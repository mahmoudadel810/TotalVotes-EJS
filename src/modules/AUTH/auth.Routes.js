import { Router } from 'express';
import { validation } from '../../middelwares/validation.js';
import { asyncHandler } from '../../utils/errorHandling.js';
import * as controller from './auth.Controller.js';
import * as validationSchemas from './auth.Validation.js';
import { auth, authorization } from '../../middelwares/Auth.js';
import { endPoints } from './auth.endPoints.js';
import { myMulter } from '../../services/Multer.js';

const router = Router();


router.get('/getSignUp' ,  controller.getSignUp)
router.post('/signUp', validation(validationSchemas.signUpSchema, '/ejs/auth/getSignUp'),asyncHandler(controller.signUp));

router.get('/getConfirm' , controller.getConfirm) //forConfirm Page Only


router.get('/confirmLink/:token', asyncHandler(controller.confirmationLink));


router.get('/getLogin' , controller.getLogin)
router.post('/login', asyncHandler(controller.Login));

router.get('/getProfile', auth(), authorization(endPoints.GET_PROFILE), controller.getProfile);
router.post('/uploadProfile', auth(), authorization(endPoints.GET_PROFILE), myMulter({}).single('picture'), controller.uploadProfile);

router.get('/logOut', auth(), asyncHandler(controller.logOut));









// router.get('/test', asyncHandler(controller.testApi));
// router.get('/test2', asyncHandler(controller.testApi2))



export default router;