--
local args, commands = { ... }, { };
local headers = { Accept = 'application/lua', ['User-Agent'] = 'CCPM-Client/0.1.0' };
local registryURL = 'https://ccpm-schroffl.rhcloud.com/registry/';
local packageFile, moduleBaseDir, cfgFile = 'package.ccp', 'modules', '.ccpm';

-- Read and parse the ccpm config
local function getConfigFile(dir)
	local cfgFilePath = '/' .. shell.resolve(dir .. '/' .. cfgFile);

	if fs.exists(cfgFilePath) then return textutils.unserialize( fs.open(cfgFilePath, 'r').readAll() ) or { }
	else
		local fHandle = fs.open(cfgFilePath, 'w');
		local data = { registry = 'https://ccpm-schroffl.rhcloud.com/registry/' };

		fHandle.write(textutils.serialize(data));
		fHandle.close();
		return data;
	end
end

-- Save ccpm config
local function saveConfigFile(dir, data)
	local cfgFilePath = '/' .. shell.resolve(dir .. '/' .. cfgFile);
	local fHandle = fs.open(cfgFilePath, 'w');

	fHandle.write(textutils.serialize( data ));

	return fHandle.close();
end

-- Set a property in the config
local function setConfigProperty(key, ...)
	local cfg = getConfigFile('/');

	cfg[key] = table.concat(arg or nil, ' ');

	saveConfigFile('/', cfg);
	return cfg[key];
end

-- Get a property from the config
local function getConfigProperty(key)
	return getConfigFile('/')[key];
end


-- Check whether a given directory has a package file
local function hasPackageFile(dir)
	return fs.exists(dir .. '/' .. packageFile) and not fs.isDir(dir .. '/' .. packageFile);
end

-- Get the package file for a given directory
-- @param dir - The directory to get the file from
local function getPackageFile(dir)
	local path = dir .. '/' .. packageFile;

	if hasPackageFile(dir) then
		local handle, content, parsed = fs.open(path, 'r');
		content = handle.readAll();
		parsed = textutils.unserialize(content);

		if type(parsed) == 'nil' then return error('Unable to parse ' .. packageFile);
		else return parsed end
	else
		return error(packageFile .. ' not found for\n' .. dir);
	end	
end

-- Save a given table as a package file
-- @param dir - The directory of the file
-- @param data - The table to save
local function savePackageFile(dir, data)
	local path = dir .. '/' .. packageFile;

	local fHandle = fs.open(path, 'w');

	fHandle.write(textutils.serialize( data ));
	fHandle.close();
end

-- Get the module directory for a given path
-- @param dir
local function getModuleDir(dir)
	return '/' .. shell.resolve(dir .. '/' .. moduleBaseDir .. '/') .. '/';
end


-- Merge two tables and return it
-- @param tbl1 - The table to merge into
-- @param tbl2 - The table to merge
local function merge(tbl1, tbl2)
	for k, v in pairs(tbl2) do tbl1[k] = v end
	return tbl1;
end


-- Returns a hexadecimal representation of the passed string
-- @param str - The string to convert
local function hexify(str)
	local hexString = '';

	for i = 0, #str do
		local char = string.byte( string.sub(str, i, i) );

		if char then
			local hexChar = string.format('%x', char);
			hexChar = string.len(hexChar) < 2 and '0' .. hexChar or hexChar;
			hexString = hexString .. hexChar;
		end
	end

	return hexString;
end


-- Convert a directory structure to a table
-- @param dir - The directory to parse
local function tablify(dir, tbl)
	-- If tbl is not of type 'table', make it one
	if type(tbl) ~= 'table' then tbl = { } end

	-- Loop through all listings in the given directory
	for i, file in ipairs(fs.list(dir)) do

		local path = dir .. '/' .. file;

		-- The current item is a directory -> go recursive
		if fs.isDir(path) and file ~= moduleBaseDir then 
			tbl[file] = { };
			tablify(path, tbl[file]);

		-- Otherwise just append it to the table
		elseif file ~= moduleBaseDir then
			local fHandle = fs.open(path, 'r');

			tbl[file] = hexify(fHandle.readAll());
			fHandle.close();
		end
	end

	return tbl;
end

-- Convert a table to a directory structure
-- @param dir - The directory to extract everything into
local function dirify(dir, tbl, isHex)
	-- If the directory does not exist, create it
	if not fs.exists(dir) then fs.makeDir(dir) end

	-- Loop through all listings in the table
	for file, content in pairs(tbl) do
		local path = dir .. '/' .. file;

		if type(content) == 'table' and file ~= moduleBaseDir then dirify(path, content, isHex)
		elseif file ~= moduleBaseDir then
			local fHandle, clearString = fs.open(path, 'w'), '';

			if not fHandle then return error('Could not open file handle for\n' .. path) end

			if isHex then for char in string.gmatch(content, '..') do
				clearString = clearString .. string.char(tonumber( char, 16 ));
			end else
				clearString = content;
			end

			fHandle.write(clearString);
			fHandle.close();
		end
	end
end


-- Join given arguments together to form a url
-- @param base - The base url
local function urlify(base, ...)
	local lastChar, urltable = string.sub(base, -1);

	if lastChar == '/' then base = string.sub(base, 0, -2) end
	urltable = { base };

	for i, part in ipairs(arg) do
		part = string.gsub(part, '^/+', '');
		part = string.gsub(part, '/+$', '');

		table.insert(urltable, part);
	end

	return table.concat(urltable, '/');
end

-- Perform an http request
-- @param method - The HTTP method
-- @param parse - Parse the response to a table?
-- @param url - The url
-- @param ... - Any other args passed to the given method
local function httpRequest(method, parse, url, ...)
	local requestString, handle = method:upper() .. ' ' .. url, http[method]( url, unpack(arg) );

	if type(handle) == 'table' then
		local content = handle.readAll();
		content = parse and textutils.unserialize(content) or nil;

		if parse and not content then return error('HTTP request could not be parsed:\n' .. requestString)
		else
			handle.getResponseCode = function() return content.statusCode end

			return {
				success = handle.getResponseCode() == 200,
				body = content.body };
		end
	else
		return error('HTTP request did not return a handle:\n' .. requestString);
	end
end


-- Prompt a user
-- @param text - The prompting text
-- @param mask - The mask character for read()
local function prompt(text, mask)
	write(text);
	return read(mask);
end


-- Gather requried credentials from a user
local function gatherCredentials()
	return prompt('username: '), prompt('password: ', '*');
end


-- Throw an error that was returned by the server
-- @param err - The error text
local function throwServerResponse(err)
	return error('> ' .. (err or ''), -1);
end


-- Initialize a new package in the given directory
-- @param dir - The directory in which to set up the package
commands['init'] = {
	func = function(dir)
		if hasPackageFile(dir) then error('This directory already contains a ' .. packageFile, -1) end

		local req = httpRequest('get', true, urlify(registryURL, 'init'), headers);

		if req.success then
			-- Start prompting the user for required information
			for i, key in ipairs(req.body.prompt) do
				if type(req.body[packageFile][key]) == 'string' then req.body[packageFile][key] = string.gsub(req.body[packageFile][key], '%$dirname', dir):gsub('^/', '') end

				local res = prompt(key .. ': ');
				req.body[packageFile][key] = #res > 0 and res or req.body[packageFile][key];
			end

			dirify(dir, { [packageFile] = textutils.serialize(req.body[packageFile]) });
		else
			throwServerResponse(req.body.error);
		end
	end,
	help = "Initialize a new package in the current directory. You will be prompted for required information",
	usage = "init"
};

-- Publish the package in the given directory
-- @param dir - The directory of the package
commands['publish'] = {
	func = function(dir)
		local pkgInfo = getPackageFile(dir);
		local pkgDir = tablify(dir);

		pkgDir[packageFile] = pkgInfo;

		local uName, uPass = gatherCredentials();
		local authHeaders = { ['x-auth-username'] = uName, ['x-auth-password'] = uPass };

		local req = httpRequest( 'post', true, urlify(registryURL, 'package', pkgInfo.name, pkgInfo.version), textutils.serializeJSON(pkgDir), merge(authHeaders, headers) );

		if req.success then
			print(req.body.msg);
		else
			throwServerResponse(req.body.error);
		end
	end,
	help = "Publish a package. You will be prompted for username and password",
	usage = "publish"
};

-- Install a package into a directory module folder
-- @param dir - The directory in which to install the module
-- @param input - An input string containing package name and version
commands['install'] = { 
	func = function(dir, input, save, iterations)
		-- No package specified? Silly user...
		if type(input) ~= 'string' then error('No package specified', -1)
		elseif type(iterations) ~= 'number' then iterations = 0 end

		-- Extract package name and version, if an invalid version format is used, it's going to install the latest version
		local name, rest = string.match(input:lower(), '^([%a\-\_]+)(.*)$');
		local version = rest and string.match(rest:lower(), '^@(%d+%.%d+%.%d+)$') or 'latest';

		-- Perform the request
		local req = httpRequest('get', true, urlify(registryURL, 'package', name, version), headers);

		-- It was successful
		if req.success then
			local pkgInfo = req.body[packageFile];
			local pkgExists = hasPackageFile(getModuleDir(dir) .. pkgInfo.name) and getPackageFile(getModuleDir(dir) .. pkgInfo.name) or nil;

			-- Save the package to dependencies
			if save == '--save' then
				local pkgFile = getPackageFile(dir);
				pkgFile.dependencies[pkgInfo.name] = pkgInfo.version;
				savePackageFile(dir, pkgFile);
			end

			-- Gives some idea of dependency level
			io.write(string.rep(' ', iterations));

			-- Tell the user if the package is already installed
			if pkgExists then print(pkgInfo.name , 'already installed. Updating');
			else print('Installing', pkgInfo.name .. '@' .. pkgInfo.version) end

			-- Repeat this process for all dependencies
			for n, v in pairs(pkgInfo.dependencies) do commands['install']( dir, n .. '@' .. v, '', iterations + 1 ) end

			req.body[packageFile] = hexify(textutils.serialize( pkgInfo ));
			dirify(getModuleDir(dir) .. pkgInfo.name, req.body, true);

			io.write(string.rep(' ', iterations)); -- Again: dependency level
			print('Successfully installed', pkgInfo.name .. '@' .. pkgInfo.version);

		-- It wasn't...
		else
			throwServerResponse(req.body.error);
		end
	end,
	help = "Install a given package",
	usage = "install <name[@version]> <[--save]>"
};

-- Remove a package from a directories modules folder
-- @param dir - The directory
-- @param pkg the packages name
commands['remove'] = {
	func = function(dir, pkgName, save)
		if type(pkgName) ~= 'string' then error('No package specified', -1) end

		local pkgDir = getModuleDir(dir) .. pkgName;
		local pkgInfo = getPackageFile(pkgDir);

		-- Remove the package from the dependencies as well?
		if save == '--save' then
		end

		print('Removing', pkgDir);
		print(fs.delete(pkgDir));
	end,
	help = "Delete a given package",
	usage = "remove <name>"
};

-- Run a given file
commands['run'] = {
	func = function(dir, file)
		local pkgFile = not file and getPackageFile(dir) or { };

		local function require(fName, path)
			local isPkgName = string.find(fName, '^[%a%-_]+$') and true or false;
			local fPath = '';

			-- It's a package name
			if isPkgName then
				local pkgPath = getModuleDir(dir) .. fName .. '/';
				fPath =  pkgPath .. '/' .. getPackageFile(pkgPath).main;
			-- It's an absolute or relative path
			else
				fPath = path .. '/' .. fName;
			end

			fPath = '/' .. shell.resolve(fPath);

			-- Does the file even exist?308
			if not fs.exists(fPath) then error('File not found:\n' .. (fPath or 'nil')) end

			-- Set up the environment and load the file
			local pkgEnv = setmetatable({ }, { __index = _G });
			local pkgFunc = assert(loadfile( fPath ));

			-- Create a wrapper to automatically keep track of the current path
			pkgEnv.require = function(fName)
				local extractedPath = string.match(fPath, '^(.*/)(.+)$');
				return require(fName, extractedPath);
			end

			-- Set the environment
			setfenv(pkgFunc, pkgEnv);

			-- Return the packages 'exports'
			return pkgFunc();
		end

		-- Require this package or the given file to get everything running
		require('./' .. file, dir);
	end,
	help = "Run a file with function require exposed to it",
	usage = "ccpm run <file>"
};

-- Create a new account
commands['register'] = { 
	func = function(dir)
		local uName, uPass = gatherCredentials();

		local req = httpRequest( 'post', true, urlify(registryURL, 'user'), textutils.serializeJSON({ name = uName, pass = uPass }), headers );

		if req.success then
			print(req.body.msg);
		else
			throwServerResponse(req.body.error);
		end
	end,
	help = "Create a new account. You will be prompted for username and password",
	usage = "register"
};

-- Update the version of a package
commands['version'] = {
	func = function(dir, input)
		local pkgFile = getPackageFile(dir);
		local major, minor, patch = string.match(pkgFile.version, '^(%d+)%.(%d+)%.(%d+)$')

		major = tonumber(major);
		minor = tonumber(minor);
		patch = tonumber(patch);

		local previous = major .. '.' .. minor .. '.' .. patch;

		if input == 'major' then 
			major = major + 1;
			minor = 0;
			patch = 0;
		elseif input == 'minor' then
			minor = minor + 1;
			patch = 0;
		elseif input == 'patch' then
			patch = patch + 1;
		else
			major, minor, patch = string.match(input or '', '^(%d+)%.(%d+)%.(%d+)$');
			if not major or not minor or not patch then error('Invalid version format', -1) end
		end

		pkgFile.version = major .. '.' .. minor .. '.' .. patch;

		print(previous, '->', pkgFile.version);

		savePackageFile(dir, pkgFile);
	end,
	help = "Increment the version of your package",
	usage = "version <major|minor|patch>"
};

-- Set a properties value in the config
commands['set'] = {
	func = function(dir, key, ...)
		print(key, '->', setConfigProperty( key, unpack(arg) ));
	end,
	help = "Set a property in the ccpm config",
	usage = "set <property> <value>"
};

-- Get a properties value from the config
commands['get'] = {
	func = function(dir, key)
		print(getConfigProperty( key ));
	end,
	help = "Get a property from the ccpm config",
	usage = "get <property>"
};

-- Alias for install
commands['i'] = commands['install'];

-- Print some help
commands['help'] = {
	func = function(dir, command)
		if type(commands[command]) == 'nil' then error('Unkown command: ' .. (command or 'nil'), -1)
		else 
			print(commands[command].help, '\n');
			print('Usage:', commands[command].usage);
		end
	end,
	help = "Print the help message for a given command",
	usage = "help <command>"
};

-- Get the registry URL from the config
registryURL = getConfigFile('/').registry or registryURL;

-- Exctract the supplied command and call its corresponding function
local cmd = table.remove(args, 1);

cmd = type(commands[cmd]) == 'nil' and 'help' or cmd;

commands[ cmd ].func( unpack({ '/' .. shell.dir(), unpack(args) }) );