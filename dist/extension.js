module.exports =
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/EntityProvider.ts":
/*!*******************************!*\
  !*** ./src/EntityProvider.ts ***!
  \*******************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EntityProvider = void 0;
const vscode = __webpack_require__(/*! vscode */ "vscode");
const fs = __webpack_require__(/*! fs */ "fs");
const entity_1 = __webpack_require__(/*! ./entity */ "./src/entity.ts");
class EntityProvider {
    constructor(workspaceRoot) {
        this.workspaceRoot = workspaceRoot;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.entityList = [];
    }
    refresh() {
        this._onDidChangeTreeData.fire(undefined);
    }
    // editEntity(ent:Entity): void{
    // 	vscode.window.showTextDocument(ent.filePath);
    // }
    analyze() {
        return __awaiter(this, void 0, void 0, function* () {
            this.entityList = [];
            if (!this.topLevelFile) {
                vscode.window.showInformationMessage('No top levl file set. Set a top level file using the SetTopLevel command');
            }
            else {
                const path = vscode.workspace.rootPath;
                console.log('start analyzing with root file ' + this.topLevelFile);
                let files = [];
                getVhdlFiles(path, files);
                // files.forEach(file =>{this.entityList.push(new Entity(file));});
                // files.forEach(function(this:any, file:string)
                // {
                // 	this.entityList.push(new Entity(file));
                // }.bind(this)	
                // );
                // readInterface.on('line', function(this:any, line: any) {
                // files.forEach(file =>{
                // 	var newEntity = new Entity(file);
                // 	if(file === this.topLevelFile)
                // 	{
                // 		this.topLevelEntity = newEntity;
                // 	}
                // 	this.entityList.push(newEntity);
                // });
                vscode.window.withProgress({
                    location: vscode.ProgressLocation.Notification,
                    title: "Analyzing VHDL file ",
                    cancellable: false,
                }, (progress, token) => __awaiter(this, void 0, void 0, function* () {
                    const p = new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                        progress.report({ increment: 0 });
                        var progressCounter = 0;
                        for (const file of files) {
                            progressCounter++;
                            this.entityList.push(new entity_1.Entity(file));
                            progress.report({ increment: (progressCounter / files.length), message: this.entityList[this.entityList.length - 1].label + "..." });
                            if (file === this.topLevelFile) {
                                this.topLevelEntity = this.entityList[this.entityList.length - 1];
                            }
                            yield this.entityList[this.entityList.length - 1].readFromFile();
                        }
                        for (const ent of this.entityList) {
                            ent.findChieldEntities(this.entityList);
                        }
                        console.log("Analysis complete " + this.entityList.length);
                        vscode.commands.executeCommand('vhdlhierarchy.refreshEntry');
                        resolve();
                    }));
                    return p;
                }));
                // files.forEach(function(this:any, file:string)
                // 	{
                // 	}.bind(this)	
                // 	);
                // await this.entityList[this.entityList.length - 1].readFromFile();	
                // var bar = new Promise((resolve, reject) => {
                // 	files.forEach(function(this:any, file:string)
                // 	{
                // 		this.entityList.push(new Entity(file));
                // 		if (file === this.topLevelFile)
                // 		{
                // 			this.topLevelEntity = this.entityList[this.entityList.length - 1];
                // 		}
                // 	}.bind(this)	
                // 	);
                // 	resolve();
                // });
                // bar.then(() => {
                // 	console.log('All done! number of entities: ' + this.entityList.length);
                // 	console.log('top level entity name: ' + this.topLevelEntity?.label);
                // });
                // // await this.entityList[0].readFromFile();
                // // var foo = new Promise((resolve, reject) => {
                // // 	this.entityList.forEach(async function(this:any, ent:Entity)
                // // 	{
                // // 		await ent.readFromFile();
                // // 		resolve();
                // // 	}.bind(this)	
                // // 	);
                // // });
                // // foo.then(() => {
                // // 	console.log('All done 2 number of entities: ' + this.entityList.length);
                // // });
            }
        });
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!this.topLevelFile) {
            vscode.window.showInformationMessage('No top levl file set. Set a top level file using the SetTopLevel command');
            return Promise.resolve([]);
        }
        const root = [new entity_1.Entity("\test\test\entity1.vhd")];
        if (element) {
            return Promise.resolve(element.childEntities);
        }
        else if (this.topLevelEntity) {
            return Promise.resolve([this.topLevelEntity]);
        }
        else {
            return Promise.resolve([]);
        }
    }
    //  public getVhdlFiles(dir:String, filelist:string[] ) : string[]
    // {
    // 	var path = require('path');
    // 	var fs = require('fs'),
    // 	files = fs.readdirSync(dir);
    // 	filelist = filelist || [];
    // 	files.forEach(function(file:String) {
    // 		if (fs.statSync(path.join(dir, file)).isDirectory()) {
    // 			filelist = EntityProvider.getVhdlFiles(path.join(dir, file), filelist);
    // 		}
    // 		else if (path.extname(file) === ".vhd"){
    // 			filelist.push(path.join(dir, file));
    // 		}
    // 	});
    // 	return filelist;
    // }
    // /**
    //  * Given the path to package.json, read all its dependencies and devDependencies.
    //  */
    // private getDepsInPackageJson(packageJsonPath: string): Dependency[] {
    // 	if (this.pathExists(packageJsonPath)) {
    // 		const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    // 		const toDep = (moduleName: string, version: string): Dependency => {
    // 			if (this.pathExists(path.join(this.workspaceRoot, 'node_modules', moduleName))) {
    // 				return new Dependency(moduleName, version, vscode.TreeItemCollapsibleState.Collapsed);
    // 			} else {
    // 				return new Dependency(moduleName, version, vscode.TreeItemCollapsibleState.None, {
    // 					command: 'extension.openPackageOnNpm',
    // 					title: '',
    // 					arguments: [moduleName]
    // 				});
    // 			}
    // 		};
    // 		const deps = packageJson.dependencies
    // 			? Object.keys(packageJson.dependencies).map(dep => toDep(dep, packageJson.dependencies[dep]))
    // 			: [];
    // 		const devDeps = packageJson.devDependencies
    // 			? Object.keys(packageJson.devDependencies).map(dep => toDep(dep, packageJson.devDependencies[dep]))
    // 			: [];
    // 		return deps.concat(devDeps);
    // 	} else {
    // 		return [];
    // 	}
    // }
    pathExists(p) {
        try {
            fs.accessSync(p);
        }
        catch (err) {
            return false;
        }
        return true;
    }
}
exports.EntityProvider = EntityProvider;
function getVhdlFiles(dir, filelist) {
    var path = __webpack_require__(/*! path */ "path");
    var fs = __webpack_require__(/*! fs */ "fs"), files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function (file) {
        if (fs.statSync(path.join(dir, file)).isDirectory()) {
            filelist = getVhdlFiles(path.join(dir, file), filelist);
        }
        else if (path.extname(file) === ".vhd") {
            filelist.push(path.join(dir, file));
        }
    });
    return filelist;
}


/***/ }),

/***/ "./src/entity.ts":
/*!***********************!*\
  !*** ./src/entity.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Entity = void 0;
const vscode = __webpack_require__(/*! vscode */ "vscode");
class Entity extends vscode.TreeItem {
    constructor(filePath) {
        super("...");
        this.analyzed = false;
        this.library = "";
        this.childEntitiesText = [];
        this.childEntities = [];
        this.filePath = filePath;
        var path = __webpack_require__(/*! path */ "path");
        var filename = path.basename(filePath);
        this.label = filename;
        this.command = { command: 'vscode.open', title: "Open File", arguments: [vscode.Uri.file(filePath)] };
        // this.contextValue = 'file';
    }
    // @ts-nocheck
    get tooltip() {
        if (!this.analyzed) {
            return `${this.label}-not analyzed`;
        }
        return `${this.label}-analyzed`;
    }
    // @ts-nocheck
    get description() {
        if (this.library !== "") {
            return "" + this.library;
        }
        return "";
    }
    // iconPath = {
    // 	light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
    // 	dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
    // };
    readFromFile() {
        var foo = new Promise((resolve, reject) => {
            const readline = __webpack_require__(/*! readline */ "readline");
            const fs = __webpack_require__(/*! fs */ "fs");
            const readInterface = readline.createInterface({
                input: fs.createReadStream(this.filePath),
                output: process.stdout,
                console: false
            });
            readInterface.on('line', function (line) {
                const entityEx = /entity\s(?<entity>\w+)\sis/;
                const usedEntityEx = /\w+\s+:\s+entity\s+(?<entity_used>[a-zA-Z_.0-9]+)/;
                const usedCompEx = /component\s(?<component>\w+)/;
                var regexp = new RegExp(entityEx, 'i'), test = regexp.exec(line);
                if (test === null || test === void 0 ? void 0 : test.groups) {
                    var path = __webpack_require__(/*! path */ "path");
                    this.label = test.groups['entity'];
                    this.library = path.dirname(this.filePath).split(path.sep).pop();
                    console.log("entity found:" + test.groups['entity'] + "in lib " + this.library);
                }
                var regexp2 = new RegExp(usedEntityEx, 'i'), test2 = regexp2.exec(line);
                if (test2 === null || test2 === void 0 ? void 0 : test2.groups) {
                    var usedEntityName = test2.groups['entity_used'];
                    if (usedEntityName.includes('.')) {
                        //handle library usage
                        usedEntityName = usedEntityName.split('.')[1];
                    }
                    this.childEntitiesText.push(usedEntityName);
                    console.log("used entity found:" + usedEntityName);
                }
                var regexp3 = new RegExp(usedCompEx, 'i'), test3 = regexp3.exec(line);
                if (test3 === null || test3 === void 0 ? void 0 : test3.groups) {
                    this.childEntitiesText.push(test3.groups['component']);
                    console.log("used component found:" + test3.groups['component']);
                }
            }.bind(this));
            readInterface.on('close', () => {
                console.log('done reading');
                if (this.childEntitiesText.length > 0) {
                    this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
                }
                resolve(undefined);
            });
        });
        return foo;
    }
    findChieldEntities(list) {
        var _a;
        for (const ent of list) {
            let label = (_a = ent.label) === null || _a === void 0 ? void 0 : _a.toString();
            if (label) {
                if (this.childEntitiesText.indexOf(label) > -1) {
                    this.childEntities.push(ent);
                }
            }
        }
    }
}
exports.Entity = Entity;


/***/ }),

/***/ "./src/extension.ts":
/*!**************************!*\
  !*** ./src/extension.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __webpack_require__(/*! vscode */ "vscode");
// import { DepNodeProvider, Dependency } from './nodeDependencies';
const EntityProvider_1 = __webpack_require__(/*! ./EntityProvider */ "./src/EntityProvider.ts");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "vhdlhierarchy" is now active!');
    if (vscode.workspace.rootPath) {
        const path = vscode.workspace.rootPath;
        // (async () => {
        // 	for await (const f of getFiles(path)) {
        // 	  console.log(f);
        // 	}
        //   })();
        // string[] vscode.FileSystemError
        let files = [];
        // walkSync(path, files);
        getVhdlFileItems(path, files);
        const entityProvider = new EntityProvider_1.EntityProvider(vscode.workspace.rootPath);
        vscode.window.registerTreeDataProvider('vhdlHierachy', entityProvider);
        let disposable = vscode.commands.registerCommand('vhdl-hierarchy.setTopLevel', () => {
            // The code you place here will be executed every time your command is executed
            // Display a message box to the user
            //  vscode.window.showQuickPick(files, { onDidAccept: handleSelectTopLEvel});
            const quickpick = vscode.window.createQuickPick();
            quickpick.items = files;
            vscode.commands.registerCommand('vhdl-hierarchy.refreshEntry', () => entityProvider.refresh());
            quickpick.onDidChangeSelection(items => {
                vscode.window.showInformationMessage('Set top level file:  ' + items[0].label);
                entityProvider.topLevelFile = items[0].base;
            });
            quickpick.onDidAccept(() => {
                quickpick.hide();
                vscode.commands.executeCommand('vhdl-hierarchy.analyze');
            });
            quickpick.show();
        });
        context.subscriptions.push(disposable);
        context.subscriptions.push(vscode.commands.registerCommand('vhdl-hierarchy.analyze', () => entityProvider.analyze()));
    }
    else {
        console.warn("Could not start the node provider as the workspace root is empty");
    }
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
}
exports.activate = activate;
class StringItem {
    constructor(base) {
        this.base = base;
        var path = __webpack_require__(/*! path */ "path");
        this.label = path.basename(base);
        // this.description = path.dirname(path.relative(base.fsPath, uri.fsPath));
    }
}
function getVhdlFileItems(dir, filelist) {
    var path = __webpack_require__(/*! path */ "path");
    var fs = __webpack_require__(/*! fs */ "fs"), files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function (file) {
        if (fs.statSync(path.join(dir, file)).isDirectory()) {
            filelist = getVhdlFileItems(path.join(dir, file), filelist);
        }
        else if (path.extname(file) === ".vhd") {
            filelist.push(new StringItem(path.join(dir, file)));
        }
    });
    return filelist;
}
function handleSelectTopLEvel(file) {
    vscode.window.showInformationMessage('Hello World from VHDLhierarchy!, selected ' + file);
}
// const { resolve } = require('path');
// const { readdir } = require('fs').promises;
// async function* getFiles(dir:String) : any {
// 	const dirents = await readdir(dir, { withFileTypes: true });
// 	for (const dirent of dirents) {
// 	  const res = resolve(dir, dirent.name);
// 	  const ext = resolve.extname(res);
// 	  if (dirent.isDirectory()) {
// 		yield* getFiles(res);
// 	//   } else if (ext === ".vhd") {
// 	// 	yield res;
// 	  } else {
// 	  	yield res;
// 	  }
// 	}
//   }
// List all files in a directory in Node.js recursively in a synchronous fashion
var walkSync = function (dir, filelist) {
    var path = __webpack_require__(/*! path */ "path");
    var fs = __webpack_require__(/*! fs */ "fs"), files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function (file) {
        if (fs.statSync(path.join(dir, file)).isDirectory()) {
            filelist = walkSync(path.join(dir, file), filelist);
        }
        else if (path.extname(file) === ".vhd") {
            filelist.push(path.join(dir, file));
        }
    });
    return filelist;
};
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;


/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("fs");;

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("path");;

/***/ }),

/***/ "readline":
/*!***************************!*\
  !*** external "readline" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("readline");;

/***/ }),

/***/ "vscode":
/*!*************************!*\
  !*** external "vscode" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("vscode");;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__("./src/extension.ts");
/******/ })()
;
//# sourceMappingURL=extension.js.map