'use strict';

const registry = require('../registry').registry;
const type = require('type-of');

module.exports = function(req, res) {
    let query = req.query.q ? req.query.q.toLowerCase() : '',
        searchForUser;
    
    searchForUser = /^~/.test(query);

    const result = registry.filter(pkg => 
        !searchForUser ? 
            !!~pkg.name.toLowerCase().indexOf(query) || ( pkg.versions[pkg.latest] && type(pkg.versions[pkg.latest].keywords) === 'array' && iterateKeywords(pkg.versions[pkg.latest].keywords, query)) :
            pkg.owner == query.slice(1) );
    
    res.json(result);
}

function iterateKeywords( keywords, query ) {
    let match = false;
    
    for(let i=0; i<keywords.length; i++) {
        match = !!~keywords[i].toLowerCase().indexOf(query);
        if(match) break;
    }
    
    return match;
}