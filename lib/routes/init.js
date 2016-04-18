'use strict';

module.exports = function(req, res) {
    let data = { };

    data.prompt = [ 'name', 'description', 'version', 'main', 'author' ];
    data[global.packageFileName] = {
        'name': '',
        'description': '',
        'version': '0.1.0',
        'author': '',
        'main': 'index.lua',
        'dependencies': { }
    };

    res.respondAccording(data);
};