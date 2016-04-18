'use strict';

const path = require('path');

const lowdb = require('lowdb');
const storage = require('lowdb/file-async');

module.exports = lowdb(path.resolve( __dirname, '..', 'data.json' ), { storage });

