import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { Entity } from './entity';

export class EntityProvider implements vscode.TreeDataProvider<Entity> {

	private _onDidChangeTreeData: vscode.EventEmitter<Entity | undefined> = new vscode.EventEmitter<Entity | undefined>();
	readonly onDidChangeTreeData: vscode.Event<Entity | undefined> = this._onDidChangeTreeData.event;

	topLevelFile: string | undefined;

	entityList: Entity[];
	topLevelEntity: Entity | undefined;

	constructor(private workspaceRoot: string) {
		this.entityList = [];
	}

	async refresh(): Promise<void> {
		this._onDidChangeTreeData.fire(undefined);
	}

	// editEntity(ent:Entity): void{
	// 	vscode.window.showTextDocument(ent.filePath);
	// }


	async analyze() {
		this.entityList = [];
		let topLevelSetting: string | undefined = vscode.workspace.getConfiguration('VHDL-hierarchy', null).get('TopLevelFile');
		if (!this.topLevelFile) {
			if (topLevelSetting) {
				this.topLevelFile = topLevelSetting;
			}
		}
		if (!this.topLevelFile) {
			vscode.window.showInformationMessage('No top levl file set. Set a top level file using the SetTopLevel command');
		}
		else {
			const path = vscode.workspace.rootPath;
			console.log('start analyzing with root file ' + this.topLevelFile);

			let files: string[] = [];
			getVhdlFiles(path!, files);


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
			await vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: "Analyzing VHDL file ",
				cancellable: false,

			}, async (progress, token) => {
				const p = new Promise(async resolve => {

					progress.report({ increment: 0 });

					var progressCounter = 0;
					for (const file of files) {
						progressCounter++;

						this.entityList.push(new Entity(file));
						progress.report({ increment: (progressCounter / files.length), message: this.entityList[this.entityList.length - 1].label + "..." });
						if (file === this.topLevelFile) {
							// not found because is now filename instead of path
							this.topLevelEntity = this.entityList[this.entityList.length - 1];
						}
						await this.entityList[this.entityList.length - 1].readFromFile();

					}

					for (const ent of this.entityList) {
						ent.findChieldEntities(this.entityList);
					}

					console.log("Analysis complete " + this.entityList.length);
					vscode.commands.executeCommand('vhdl-hierarchy.refresh');
					resolve(undefined);

				});

				return p;
			});

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
	}

	getTreeItem(element: Entity): vscode.TreeItem {
		return element;
	}

	getChildren(element?: Entity): Thenable<Entity[]> {
		let topLevelSetting: string | undefined = vscode.workspace.getConfiguration('VHDL-hierarchy', null).get('TopLevelFile');
		if (!this.topLevelFile) {
			if (topLevelSetting) {
				this.topLevelFile = topLevelSetting;
			}
			vscode.window.showInformationMessage('No top levl file set. Set a top level file using the SetTopLevel command');
			return Promise.resolve([]);
		}

		const root = [new Entity("\test\test\entity1.vhd")];

		if (element) {
			return Promise.resolve(element.childEntities);
		} else if (this.topLevelEntity) {
			return Promise.resolve([this.topLevelEntity]);
		} else {
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

	private pathExists(p: string): boolean {
		try {
			fs.accessSync(p);
		} catch (err) {
			return false;
		}

		return true;
	}
}

function getVhdlFiles(dir: String, filelist: string[]) {
	var path = require('path');
	var fs = require('fs'),

		files = fs.readdirSync(dir);
	filelist = filelist || [];

	files.forEach(function (file: String) {
		if (fs.statSync(path.join(dir, file)).isDirectory()) {
			filelist = getVhdlFiles(path.join(dir, file), filelist);
		}
		else if (path.extname(file) === ".vhd") {
			filelist.push(path.join(dir, file));
		}
	});
	return filelist;
}