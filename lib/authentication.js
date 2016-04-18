'use strict';

const user = require('./user');

module.exports = function(req, res, next)  {

    if(user.authenticate( req.headers['x-auth-username'], req.headers['x-auth-password'] )) 
        next();
    else
        res.status(401).respondAccording({ 'error': 'Invalid password or username' });
};