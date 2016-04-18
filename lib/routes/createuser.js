'use strict';

const user = require('../user');

module.exports = function(req, res) {
    if(!('name' in req.body) || !('pass' in req.body)) return res.status(400).respondAccording({ 'error': 'Missing parameters in body' });

    user.create(req.body.name, req.body.pass)
        .then(() => res.status(200).respondAccording({ 'success': true, 'msg': 'User created' }) )
        .catch(err => res.status(409).respondAccording({ 'error': err }) );
};