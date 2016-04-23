'use strict';

global.datadir = process.argv[2] || __dirname;

const http = require('http');

const router = require('./lib/router');
const server = http.createServer(router);

router.set('port', process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 80);
router.set('ip', process.env.OPENSHIFT_NODEJS_IP || process.env.IP || '0.0.0.0');

server.listen(router.get('port'), router.get('ip'), () => 
    console.log(`Server listening on ${router.get('ip')}:${router.get('port')}`) );