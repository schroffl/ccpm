'use strict';

module.exports = function(req, res) {
    res.render('index', {
        'query': req.query.q || req.query.query || ''
    });
}