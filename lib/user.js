'use strict';

const db = require('./db');

const pwHash = require('password-hash');
const users = db('users');

class User {

    /**
     * Check wether a given user exists in the database
     * 
     * @param name - The name of the user
     */
    static find( name )  {
        return users.find({ name }) || false;
    }

    /**
     * Add a user to the database
     * 
     * @param name - The name of the user
     * @param pass - The password of the user
     */
    static create( name, pass ) {
        pass = pwHash.generate(pass);

        return new Promise((resolve, reject) => {
            return User.find(name) ? reject('User already exists') : users.push({ name, pass })
                .then(() => { db.write(); resolve(users.find({ name })) })
                .catch(reject);
        });
    }

    /**
     * Check whether the given password is valid for a given user
     * 
     * @param user - The user whose password to check against
     * @param pass - The password to verify
     */ 
    static authenticate( name, pass ) {
        const data = User.find(name);

        return data ? pwHash.verify( pass, data.pass ) : false;
    }
}

module.exports = User;