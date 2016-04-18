'use strict';

const type = require('type-of');

function jsonToLua(data, result, isArray, iterations) {
    
    if(typeof result !== 'object') result = { 'string': '{\n' };
    if(!iterations) iterations = 1;
    
    for(const key in data) {
        
        result.string += '\t'.repeat(iterations) + (isArray ? '' : `["${key}"] = `);
        
        switch(type(data[key])) {
            
            case 'number':
                result.string += `${data[key]},\n`;
                break;
            
            case 'regexp':
                data[key] = data[key].toString();
            case 'string':
                data[key] = data[key].replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\t/g, '\\t');
                result.string +=`"${data[key]}",\n`;
                break;
            
            case 'boolean':
                 result.string += (data[key] ? 'true' : 'false') + ',\n';
                break;
            
            case 'function':
            case 'undefined':
            case 'null':
                result.string += 'nil,\n';
                break;

            case 'array':
            case 'object':
                result.string += '{\n';
                if(Object.keys(data[key]).length > 0) jsonToLua(data[key], result, Array.isArray(data[key]), iterations + 1);
                result.string += '\n' + '\t'.repeat(iterations) + '},\n';
                break;
            
        }
    }
    
    result.string = result.string.trim().slice(0, result.string.lastIndexOf(','));
    
    return result.string.trim() + '\n}';
};

module.exports = jsonToLua;