const express = require('express');
const axios = require('axios');
const router = express.Router();
var db = require('../models/mysql');

const flights = require('../models/flights');

// router.get('/', (req, res) => { //(URL || Path , Call back function)
    // Call Generator of users from MySQL
//    db.query("SELECT * FROM users;", function (err, result, fields) {
//        if (err) throw err;
//         res.render('Calls_Table_Responsive/index' ,{data: result})
//     });
// })
router.get('/', flights.flightsDetails)

module.exports = router;