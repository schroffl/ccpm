'use strict';

const express = require('express');
const morgan = require('morgan');

const router = express();

global.packageFileName = 'package.ccp';

router.use(morgan('combined'));

// Configure some settings
router.set('json spaces', 4);
router.use( require('./response') );

// Require all routes
router.get('/registry/init', require('./routes/init'));

router.get('/registry/package/:package', require('./routes/package'));
router.get('/registry/package/:package/:version', require('./routes/install'));
router.post('/registry/package/:package/:version', require('./authentication'), require('./parser'), require('./routes/publish'));

router.post('/registry/user', require('./parser'), require('./routes/createuser'));

module.exports = router;