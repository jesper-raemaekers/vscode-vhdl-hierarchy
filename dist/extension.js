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
const path = __webpack_require__(/*! path */ "path");
const entity_1 = __webpack_require__(/*! ./entity */ "./src/entity.ts");
class EntityProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.entityList = [];
    }
    refresh() {
        return __awaiter(this, void 0, void 0, function* () {
            this._onDidChangeTreeData.fire(undefined);
        });
    }
    analyze() {
        return __awaiter(this, void 0, void 0, function* () {
            this.entityList = [];
            this.topLevelFile = this.getTopLevelFile();
            let workspaceFolder = vscode.workspace.workspaceFolders;
            if (workspaceFolder) {
                const path = workspaceFolder[0].uri.fsPath;
                console.log('start analyzing with root file ' + this.topLevelFile);
                let files = getSourceFiles(path);
                yield vscode.window.withProgress({
                    location: vscode.ProgressLocation.Notification,
                    title: "Analyzing VHDL file ",
                    cancellable: false,
                }, (progress, token) => __awaiter(this, void 0, void 0, function* () {
                    const p = new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                        // progress.report({ increment: 0 });
                        // var progressCounter = 0;
                        for (const file of files) {
                            // progressCounter++;
                            this.entityList.push(new entity_1.Entity(file));
                            // progress.report({ increment: (progressCounter / files.length), message: this.entityList[this.entityList.length - 1].label + "..." });
                            progress.report({ message: this.entityList[this.entityList.length - 1].label + "..." });
                            if (file === this.topLevelFile) {
                                // not found because is now filename instead of path
                                this.topLevelEntity = this.entityList[this.entityList.length - 1];
                            }
                            yield this.entityList[this.entityList.length - 1].readFromFile();
                        }
                        for (const ent of this.entityList) {
                            ent.findChieldEntities(this.entityList);
                        }
                        console.log("Analysis complete " + this.entityList.length);
                        vscode.commands.executeCommand('vhdl-hierarchy.refresh');
                        resolve(undefined);
                    }));
                    return p;
                }));
            }
        });
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (element) {
            return Promise.resolve(element.getChildren());
        }
        else if (this.topLevelEntity) {
            return Promise.resolve([this.topLevelEntity]);
        }
        else {
            return Promise.resolve([]);
        }
    }
    pathExists(p) {
        try {
            fs.accessSync(p);
        }
        catch (err) {
            return false;
        }
        return true;
    }
    getTopLevelFile() {
        let topLevelSetting = vscode.workspace.getConfiguration('VHDL-hierarchy', null).get('TopLevelFile');
        if (topLevelSetting) {
            if (this.pathExists(topLevelSetting)) {
                return topLevelSetting;
            }
            let workspaceFolder = vscode.workspace.workspaceFolders;
            if (workspaceFolder) {
                let thisWorkspace = workspaceFolder[0];
                let newPath = path.join(thisWorkspace.uri.fsPath, topLevelSetting);
                if (this.pathExists(newPath)) {
                    return newPath;
                }
            }
        }
        vscode.window.showErrorMessage('Top level file not set in settings, cannot analyze VHDL workspace.');
        return undefined;
    }
}
exports.EntityProvider = EntityProvider;
function getSourceFiles(dir) {
    let sourceExtensions = ['.vhd', '.qsys', '.tcl'];
    var path = __webpack_require__(/*! path */ "path");
    var fs = __webpack_require__(/*! fs */ "fs"), files = fs.readdirSync(dir);
    let filelist = [];
    for (const file of files) {
        if (fs.statSync(path.join(dir, file)).isDirectory()) {
            // let newfiles = ;
            filelist = filelist.concat(getSourceFiles(path.join(dir, file)));
            // filelist = getSourceFiles(path.join(dir, file), filelist);
        }
        else {
            let ext = path.extname(file);
            if (sourceExtensions.includes(ext)) {
                filelist.push(path.join(dir, file));
            }
        }
    }
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
const path = __webpack_require__(/*! path */ "path");
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
        switch (path.extname(filePath)) {
            case '.vhd':
                this.type = Entity.Type.Vhdl;
                this.iconPath = new vscode.ThemeIcon('code');
                break;
            case '.qsys':
                this.type = Entity.Type.Qsys;
                this.iconPath = new vscode.ThemeIcon('server-environment');
                break;
            case '.tcl':
                this.type = Entity.Type.HwTcl;
                break;
            default:
                this.type = Entity.Type.Vhdl;
        }
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
    getChildren() {
        if (this.type === Entity.Type.Qsys) {
            let childrenofchildren = [];
            for (const child of this.childEntities) {
                childrenofchildren = childrenofchildren.concat(child.getChildren());
            }
            return childrenofchildren;
        }
        return this.childEntities;
    }
    readFromFile() {
        var foo = new Promise((resolve, reject) => {
            const readline = __webpack_require__(/*! readline */ "readline");
            const fs = __webpack_require__(/*! fs */ "fs");
            const readInterface = readline.createInterface({
                input: fs.createReadStream(this.filePath),
                output: process.stdout,
                console: false
            });
            switch (this.type) {
                case Entity.Type.Vhdl:
                    readInterface.on('line', function (line) { this.parseVhdlLine(line); }.bind(this));
                    break;
                case Entity.Type.HwTcl:
                    readInterface.on('line', function (line) { this.parseHwTclLine(line); }.bind(this));
                    break;
                case Entity.Type.Qsys:
                    // this.label =  this.filePath.
                    this.label = path.basename(this.filePath).split('.')[0];
                    readInterface.on('line', function (line) { this.parseQsysLine(line); }.bind(this));
                    break;
            }
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
    parseQsysLine(line) {
        const entityEx = /kind="(?<entity>\w+)"/;
        var regexpEntity = new RegExp(entityEx, 'i'), testEntity = regexpEntity.exec(line);
        if (testEntity === null || testEntity === void 0 ? void 0 : testEntity.groups) {
            this.childEntitiesText.push(testEntity.groups['entity']);
        }
    }
    parseHwTclLine(line) {
        const nameEx = /set_module_property\s\w+\s{(?<name>\w+)}/; // set_module_property\s\w+\s{(?<name>\w+)}
        const entityEx = /TOP_LEVEL\s(?<entity>\w+)/; // TOP_LEVEL\s(?<entity>\w+)
        var regexpName = new RegExp(nameEx, 'i'), testName = regexpName.exec(line);
        var regexpEntity = new RegExp(entityEx, 'i'), testEntity = regexpEntity.exec(line);
        if (testName === null || testName === void 0 ? void 0 : testName.groups) {
            this.label = testName.groups['name'];
        }
        if (testEntity === null || testEntity === void 0 ? void 0 : testEntity.groups) {
            this.childEntitiesText.push(testEntity.groups['entity']);
        }
    }
    parseVhdlLine(line) {
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
(function (Entity) {
    let Type;
    (function (Type) {
        Type[Type["Vhdl"] = 0] = "Vhdl";
        Type[Type["Qsys"] = 1] = "Qsys";
        Type[Type["HwTcl"] = 2] = "HwTcl";
    })(Type = Entity.Type || (Entity.Type = {}));
})(Entity = exports.Entity || (exports.Entity = {}));


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
const EntityProvider_1 = __webpack_require__(/*! ./EntityProvider */ "./src/EntityProvider.ts");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    const entityProvider = new EntityProvider_1.EntityProvider();
    vscode.window.registerTreeDataProvider('vhdlHierachy', entityProvider);
    vscode.commands.registerCommand('vhdl-hierarchy.refresh', () => entityProvider.refresh());
    vscode.commands.registerCommand('vhdl-hierarchy.analyze', () => entityProvider.analyze());
    vscode.commands.executeCommand('vhdl-hierarchy.analyze');
}
exports.activate = activate;
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