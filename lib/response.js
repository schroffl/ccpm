'use strict';

const jsonToLua = require('./jsontolua');
const type = require('type-of');

module.exports = function(req, res, next) {

    let format = req.headers['accept'] || 'application/json';

    res.respondAccording = data => {
        // ComputerCraft doesn't seem to like any response codes other than 200
        if( /^CCPM-Client\/(\d+\.\d+\.\d+)?.*/.test( req.headers['user-agent'] ) ) data = { 'body': data, 'statusCode': res.statusCode }; res.status(200);
        
        data = type(data) === 'object' && format.toLowerCase() === 'application/lua' ? jsonToLua(data) : JSON.stringify(data, null, 4);

        res.set('Content-Type', format).end(data);
        return res;
    };

    return next();
};