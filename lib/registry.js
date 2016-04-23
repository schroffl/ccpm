'use strict';

const db = require('./db');

const registry = db('packages');
const v = require('./version');

class PackageWrapper {

    /**
     * Returns a wrapper with helper functions
     * 
     * @constructor
     * 
     * @params {String} name - The name of the package
     */
    constructor(name, create, owner) {

        return new Promise((resolve, reject) => {
            this._package = registry.find({ name });
            this.created = false;

            if(!this._package && create)
                registry.push({ name, owner, 'latest': create.version, 'versions': { [create.version]: create } }).then(result => {
                    this._package = registry.find({ name });
                    this.created = true;

                    return this._package ? resolve(this) : reject('Failed to create package');
                });
                
            else if(this._package)
                return resolve(this);
            else
                return reject('Package not found')
        });
    }

    /**
     * Returns the name of the package
     */
    getName() {
        return this._package.name;
    }

    /**
     * Returns the author of the package
     */
    getOwner() {
        return this._package.owner;
    }

    /**
     * Check whether a given version exists for this package
     *
     * @params version - The version to check for
     * 
     * @returns Whether the package version exists
     */
    hasVersion(version) {
        return version in this._package.versions;
    }

    /**
     * Add a version to a packages history
     * 
     * @params version - The version to add
     */
    addVersion(version, pkgInfo) {
        if(!this.hasVersion(version)) {
            this._package.versions[version] = pkgInfo
            this._package.latest = version
            this.save();
            return true;
        } else
            return false;
    }
    
    getIdealVersion(str) {
        let versionList = [ ];
        
        for(const version in this._package.versions)
            versionList.push(version);
        
        return this._package.versions[ v.getBestMatch(str, versionList) ];
    }

    /**
     * Return the package as-is from the database
     */
    getJSON() {
        return this._package; 
    }

    /**
     * Save the package to the registry
     */
    save() {
        db.write();
        return this;
    }
}

module.exports = {
    registry,
    db,
    'wrap': (name, create, owner) => new PackageWrapper(name, create, owner)
};