'use strict';

const express = require('express');
const morgan = require('morgan');

const path = require('path');
const router = express();

const registry = express();
const gui = express();

global.packageFileName = 'package.ccp';

// Configure some settings
router.set('json spaces', 4);

router.use(require('./response'));
router.use('/registry', registry);
router.use('/', gui);

// Registry routes
registry.use(morgan('combined'));

registry.get('/init', require('./routes/init'));

registry.get('/package/:package', require('./routes/package'));
registry.get('/package/:package/:version', require('./routes/install'));
registry.post('/package/:package/:version', require('./authentication'), require('./parser'), require('./routes/publish'));

registry.get('/search', require('./routes/search'));

registry.post('/user', require('./parser'), require('./routes/createuser'));

// UI routes
gui.set('view engine', 'jade');
gui.use(express.static(path.resolve( __dirname, '..', 'public' )));

gui.get('/', require('./routes/gui/index'));

module.exports = router;