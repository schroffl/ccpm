'use strict';

const path = require('path');
const fs = require('fs');

const jsontolua = require('../jsontolua');
const registry = require('../registry');

module.exports = function(req, res) {

    req.params.version = req.params.version.replace(/^latest$/, '>=0.0.0');
    
    registry.wrap(req.params.package)
        .then(pkg => {
            const version = pkg.getIdealVersion(req.params.version);

            if(version) {
                const pkgFile = require( path.resolve( global.datadir, 'packages', `${pkg.getName()}@${version.version.toString()}.json` ) );

                res.status(200).respondAccording(pkgFile);
            } else
                throw `This version does not exist for '${pkg.getName()}'`;

        }).catch(err => res.status(404).respondAccording({ 'error': err }));
};