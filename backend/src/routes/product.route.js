const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const upload = require('../middlewares/uploadImage');

router.get('/products', productController.getAllProducts);
router.post('/products/add', upload.single('hinh_anh'), productController.createProduct);


module.exports = router;
