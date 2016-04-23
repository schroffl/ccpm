'use strict';

const path = require('path');
const fs = require('fs');

const async = require('async');
const type = require('type-of');

const registry = require('../registry');

fs.stat(path.resolve(global.datadir, 'packages'), (err, stat) => {
    if(err || !stat.isDirectory())
         fs.mkdir(path.resolve(global.datadir, 'packages'), console.log)
});

module.exports = function(req, res) {

    if(!(global.packageFileName in req.body)) return res.status(404).respondAccording({ 'error': 'missing required package information' });

    // Obtain information about the package
    const pkgInfo = req.body[global.packageFileName],
          filePath = path.resolve(global.datadir, 'packages', `${pkgInfo.name}@${pkgInfo.version}.json`);

    let regPkg;

    async.series([
            // If the package isn't found in the registry, add it
            callback => 
                registry.wrap( pkgInfo.name, pkgInfo, req.headers['x-auth-username'] ).then( data => callback(null, regPkg = data) ).catch(err => callback({ 'code': 404, 'msg': err })),

            // If the version is already published abort the process
            callback => {
                if(req.headers['x-auth-username'] != regPkg.getOwner()) callback({ 'code': 403, 'msg': 'You don\'t seem to be the owner of this package' });
                else regPkg.addVersion(pkgInfo.version, pkgInfo) || regPkg.created ? callback(null) : callback({ 'code': 423, 'msg': 'You may not publish over an existing version' }) },

            // Save the file
            callback =>
                fs.writeFile(filePath, JSON.stringify(req.body, null, 4), err =>
                    callback(err ? { 'code': 500, 'msg': err } : null) )
        ], err => {
            if(err)
                return res.status(err.code).respondAccording({ 'error': err.msg });
            else 
                return res.status(200).respondAccording({ 'msg': `${pkgInfo.name}@${pkgInfo.version} sucessfully published` });
        });
};