# CCPM Client
**ccpm** is a packet manager for [ComputerCraft](http://www.computercraft.info/).
It allows for multi-file packages and takes care of dependencies.

## Installation
This will install ccpm in your root directory
```shell
$ pastebin get Wpb8LUPu /ccpm
```

## Guide on Publishing Your First Package
If you want to publish packages via CCPM, take a look at [this](/client/QUICKSTART.md) QuickStart Guide.

## <a name="disclaimer-versioning"></a> Versioning
Currently, [Semantic Versioning](http://semver.org/) is being used, and there are no plans on changing that.

## package.ccp
This file is used to hold information about a package. It's content is basically just a serialized lua table.
Here are some properties it may contain:
  
Property | Description | Must-have
-------------: | :------------- | -------:
`name`  | The name of the package | yes
`version`  | The version of the package *(This must change with each update)* | yes
`description` | A short description of the package | no
`main` | The main file of the package *(Default: `index.lua`)* | yes
`author` | The author of the package *(Does not affect authentication)* | no
`dependencies` | Any dependencies needed for the package | no
`keywords` | A few keywords to precisely describe your package | no

## Commands
Commands are meant to be run with this syntax: `ccpm <command> <...>`  
**Note:** For this documentation, `$dir` will represent the directory in which the command is run  
***

#### help \<command\>
Display a description and usage of the given command.  
`ccpm help install` shows information about the `install` command.
***

#### install \<package*[@version]*\> *[--save]*
Install a given package at an optionally specified version.  
If *version* is omitted, it will automatically install the latest version of the package.  
If the flag *--save* is set, it will save the package to the dependencies in `$dir/package.ccp`.  
`ccpm install package@1.0.0` installs `test` at version `1.0.0` into `$dir/modules/`.
***

#### remove \<package\>
Deletes a package from `$dir/modules/`
***

#### init
Initialize a new package.  
You will be prompted for required information about your package.
All the information will be saved into `$dir/package.ccp`
***

#### register
Create a new account in order to publish packages.  
You will be prompted for a username and a password.
***

#### publish
This will upload `$dir` to the registry with the given information in `$dir/package.ccp`.  
However, you have to increment the version each time you publish, since it is not allowed to overwrite an already existing version.
***

#### version \<major | minor | patch | x.x.x\>
Increment a given part or set the version of the package as described in [Versioning](#disclaimer-versioning).  
The result will be saved to `$dir/package.ccp`.
***

#### run \<*[file]*\>
If *file* is omitted, it will look for the `main` property in `$dir/package.ccp`  
To any file run via this command, the function [`require`](#function-require) will be exposed.  
e.g. `ccpm run ./test.lua` runs the file `$dir/test.lua` which then has access to [`require`](#function-require)
***

#### set \<property, value\>
Set the *property* to the given *value* in the ccpm config.  
e.g. `ccpm set registry https://example.com/` sets the registry to use to `https://example.com/`
***

#### get \<property\>
Get the value of a *property* from the ccpm config.
e.g. `ccpm get registry` prints `https://example.com/` or whatever the registry is set to

## Exporting and Requiring

#### Exporting
This is just done by returning whatever you want.  
Example:
```lua
-- example.lua
return 'I can be a String,', { foo = 'a', bar = 'table,' }, function( ) return 'a function or whatever you want' end
```
***

#### <a name="function-require"></a> require( str )
The parameter *str* may look like this:

input | Result
---:|:------
Path |  Passing a path like `/test.lua`, `./test.lua`, etc. will just resolve and require the file
Package name | Passing something like `my-package` will look for the package in `$dir/modules/`, run and return its `main` file

Example:
```lua
local str, tbl, func = require('./example.lua');

print(str, tbl.foo, tbl.bar, func());
```

Results in  
![result](http://i.imgur.com/daZhezw.png)
