import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from "child_process";

import { Entity } from './entity';

export class EntityProvider implements vscode.TreeDataProvider<Entity> {

	private _onDidChangeTreeData: vscode.EventEmitter<Entity | undefined> = new vscode.EventEmitter<Entity | undefined>();
	readonly onDidChangeTreeData: vscode.Event<Entity | undefined> = this._onDidChangeTreeData.event;

	topLevelFile: string | undefined;

	entityList: Entity[];
	topLevelEntity: Entity | undefined;

	constructor() {
		this.entityList = [];
	}

	async refresh(): Promise<void> {
		this._onDidChangeTreeData.fire(undefined);
	}

	async analyze() {
		this.entityList = [];


		this.topLevelFile = this.getTopLevelFile();

		let workspaceFolder = vscode.workspace.workspaceFolders;

		if (workspaceFolder) {
			const path = workspaceFolder[0].uri.fsPath;
			console.log('start analyzing with root file ' + this.topLevelFile);

			let files: string[] = getSourceFiles(path);

			await vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: "Analyzing VHDL file ",
				cancellable: false,

			}, async (progress, token) => {
				const p = new Promise(async resolve => {

					// progress.report({ increment: 0 });

					// var progressCounter = 0;
					for (const file of files) {
						// progressCounter++;

						this.entityList.push(new Entity(file));
						// progress.report({ increment: (progressCounter / files.length), message: this.entityList[this.entityList.length - 1].label + "..." });
						progress.report({ message: this.entityList[this.entityList.length - 1].label + "..." });
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

		}
	}

	getTreeItem(element: Entity): vscode.TreeItem {
		return element;
	}

	getChildren(element?: Entity): Thenable<Entity[]> {

		if (element) {
			return Promise.resolve(element.getChildren());
		} else if (this.topLevelEntity) {
			return Promise.resolve([this.topLevelEntity]);
		} else {
			return Promise.resolve([]);
		}

	}

	async createDot() {
		var Graph = require("graphlib").Graph, dot = require("graphlib-dot");

		var digraph = new Graph({ multigraph: true });

		if (this.topLevelEntity) {
			let nodes = this.topLevelEntity.getAllChildren();

			// digraph.setNode('"splines=ortho"');
			for (const node of nodes) {
				digraph.setNode(node.label, { shape: 'box' });
			}

			for (const node of nodes) {
				for (const child of node.childEntities) {
					digraph.setEdge(node.label, child.label);
				}
			}
		}

		let workspace = vscode.workspace.workspaceFolders;
		if (workspace) {
			let pDot = path.join(workspace[0].uri.fsPath, 'hierarchy.dot');
			fs.writeFileSync(pDot, dot.write(digraph));

			exec(`dot -Tpng hierarchy.dot -o hierarchy.png`, {
				cwd: workspace[0].uri.fsPath
			}, (error, stdout, stderr) => {
				if (error) {
					console.warn(error);
				}
			});

		}


	}

	private pathExists(p: string): boolean {
		try {
			fs.accessSync(p);
		} catch (err) {
			return false;
		}

		return true;
	}

	private getTopLevelFile(): string | undefined {
		let topLevelSetting: string | undefined = vscode.workspace.getConfiguration('VHDL-hierarchy', null).get('TopLevelFile');
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

function getSourceFiles(dir: String): string[] {
	let sourceExtensions: string[] = ['.vhd', '.qsys', '.tcl'];
	var path = require('path');
	var fs = require('fs'),

		files = fs.readdirSync(dir);
	let filelist: string[] = [];


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