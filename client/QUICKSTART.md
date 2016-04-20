# Publishing Your First Package
This is a guide for anyone who is tempted to create and publish a package via CCPM.  
We're going to go through this process with the goal to create a little package that will help us to print some pretty messages.

**NOTE**: In order to use `ccpm` in any directory, I suggest you to quickly run `alias ccpm /ccpm`, this will create an alias linked to your downloaded file.

## Table of Contents
1. [Creating an Account](#section-register)
2. [Setting up the package](#section-setup)
3. [Coding our stuff](#section-code)
4. [Publishing](#section-publish)
5. [Installing the package](#section-install)
6. [Updating](#section-update)

## <a name="section-register"></a> Creating an Account
The first thing you want to do in order to publish your packages is to create an account.  
To do so, just run `ccpm register`, enter your desired username and password and you're done.  

Example:  
![Register](http://i.imgur.com/frpQxsE.png)

## <a name="section-setup"></a> Setting up the package
First of all, you'll have to create a new directory for your package and `cd` into it.  
Well done, now you can run `ccpm init` inside your newly made directory, this will prompt you to enter some required information about your package like its name, description, etc. and save this information into a file called [package.ccp](https://github.com/schroffl/ccpm/blob/master/client/README.md#packageccp)  

Example:  
![Init](http://i.imgur.com/Ii1twmD.png)  

###### version
A version according to the format specified [here](http://semver.org/).

###### main
As you can see, I have specified a file name for the field `main`. This will be the, well, main file for your package. Anything you want to export to the user (functions, etc.).

###### author
This field does not have to match your username, so you could also enter your real name in order to let people know who created the package.

## <a name="section-code"></a> Coding our stuff
At this stage, you basically just code whatever your package is supposed to do, in my case, pretty messages!

Create your `main` file: ![coding](http://i.imgur.com/q0WMRdC.png)

Write your code. The code for this demo can be found [here](https://bitbucket.org/schroffl/pretty-print/src).

**NOTE:** I highly suggest you to take a look at [Exporting and Requiring](https://github.com/schroffl/ccpm/tree/master/client#exporting-and-requiring) since it is one of the main functionalities of CCPM.

## <a name="section-publish"></a> Publishing
There you are, your package is done and ready to be published.  
To do so you just need to run `ccpm publish` inside of your packages base directory.  

Example:  
![Publish](http://i.imgur.com/VZA1rbP.png)  

This tells us, that `pretty-print` has been uploaded and published at version `0.1.0`.

## <a name="section-install"></a> Installing the package
This package can now be installed and put into action by anyone.  

Example:  
![Install](http://i.imgur.com/OBpNKuZ.png)

As you can see, this command installed `pretty-print` at its latest version.  
If you want a specific version, you can also add an `@x.y.z` behind the package name (e.g. `ccpm install pretty-print@1.2.3`)

You can now `require` this package and use it in your code:
```lua
-- test.lua
local log = require('pretty-print');

log.success('Success!');
log.warning('Something\'s wrong...');
log.error('Oh No!');
```

Running this code results in:  
![Use Package](http://i.imgur.com/n8SjRsO.png)

**NOTE:** You may notice that I ran the file via `ccpm run`, this is needed in order for `require` to work.

## <a name="section-update"></a> Updating
In order to update your package you will have to increment its version (*you can't overwrite existing versions*), this, again, should be done according to [Semantic Versioning](http://semver.org/).  
Or you can just use the `version` command.  

Example:  
![Update](http://i.imgur.com/8pfFrSk.png)  

As you can see, the version of our package has been updated from `0.1.0` to `0.1.1` and now we can publish any changes we did since the last version.  

`ccpm publish` will now yield:  
![Publish Update](http://i.imgur.com/z5iYAmk.png)

However, this will require you (*the name entered in username*) to be the owner of the package, who is the person, that initially published it.

And `ccpm install pretty-print` will now yield:  
![Install Update](http://i.imgur.com/vFwa1GA.png)

## <a name="section-conclusion"></a> Setting up the package Conclusion
That's it, you hopefully published your first package by now, if you want to get any further information about the CCPM Client you can take a look at the [documentation](https://github.com/schroffl/ccpm/blob/master/client/README.md)