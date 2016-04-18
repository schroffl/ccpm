'use strict';

const async = require('async');
const firstBy = require('thenby');

const matchCode = /^(=|>=|<=)?(\d+)\.(\d+)\.(\d+)$/i;
const compare = {
    '=': (testFor, current) => {
        return testFor.major === current.major && testFor.minor === current.minor && testFor.patch === current.patch;
    },
    '>=': (testFor, current) => {
        let result = false,
            stop = true;

        async.series([
            callback => current.major > testFor.major ? callback(stop, true) : callback(null),
            callback => current.major < testFor.major ? callback(stop, false) : callback(null),
            callback => current.minor > testFor.minor ? callback(stop, true) : callback(null),
            callback => current.minor < testFor.minor ? callback(stop, false) : callback(null),
            callback => current.patch >= testFor.patch ? callback(stop, true) : callback(stop, false)
        ], (x, keep) => result = keep.pop() );

        return result;
    }
};

/**
 * Custom versioning system derived from http://semver.org/
 */

class VersionSystem {

    /**
     * Validate version format
     * 
     * @param {String} version - The string to validate
     */
     validate(version) {
         return version.match(/^(\d+\.\d+\.\d+)$/);
     }

    /**
     * Get the best match for a given version in a list
     * 
     * @param {String} version - The version to check the list for
     * @param {Array.<String>} versions - An Array of versions
     */
    getBestMatch(version, versions) {

        version = this.parse(version);
        versions = versions.slice().map(this.parse);

        if(version) {
            versions = versions.filter(val => compare[ version.comparator ]( version, val ) );

            versions.sort(
                firstBy('major')
                .thenBy('minor')
                .thenBy('patch')
            );

            return versions.pop() || null;
        } else return null;
    }

    /**
     * Parse a version string to an object
     * 
     * @param {String} version - The version string
     * 
     * @returns An Object containing the version parts or null if the string was invalid
     */
    parse(version) {
        let matched = version.match(matchCode),
            parsed = matched ? {
                'comparator': matched[1] || '=',
                'major': matched[2],
                'minor': matched[3],
                'patch': matched[4]
            } : null;

        if(parsed) parsed.toString = () => `${parsed.major}.${parsed.minor}.${parsed.patch}`;

        return parsed;
    }

}

module.exports = new VersionSystem();