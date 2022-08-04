const express = require('express');
const router = express.Router();
module.exports = router;

router.get('/', (req,res) => { //(URL || Path , Call back function)
    res.render('dashboard/pages/dashboard');
});

// where style files will be
router.use('/', express.static('./views/dashboard'))