'use strict';

module.exports = function(req, res, next) {

    let rawJson = '';

    req
        .on('data', data => rawJson += data.toString())
        .on('end', () => {
            rawJson = rawJson || '{}';
            
            try {
                req.body = JSON.parse(rawJson);
                return next();
            } catch(err) {
                console.error(err);
                return res.status(400).respondAccording({ 'error': 'body contains malformed json' });
            }
        });
};