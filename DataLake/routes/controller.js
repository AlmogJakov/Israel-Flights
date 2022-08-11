const express = require('express');
const router = express.Router();


router.get('/', (req,res) => { //(URL || Path , Call back function)
     res.render('Prediction_Table_Responsive/index');
 });

 router.use('/',express.static('./views/Prediction_Table_Responsive'));


module.exports = router;