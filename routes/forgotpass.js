const express = require('express');
const path = require('path'); 
const userController = require('../controllers/Auth');
const app = express();
const router = express.Router();

app.use(express.static(path.join(__dirname, 'public')));

router.post('/forgotpassword', userController.forgotPassword);
router.get('/resetpassword/:resetId', userController.validateResetRequest);
router.post('/updatepassword/:resetId', userController.updatePassword);

module.exports = router;
