'use strict';

const fs = require('fs');
const path = require('path');

const registry = require('../registry');

module.exports = function(req, res) {
    registry.wrap(req.params.package)
        .then( pkg => res.status(200).respondAccording(pkg.getJSON()) )
        .catch( err => res.status(404).respondAccording({ 'error': err }) );
};