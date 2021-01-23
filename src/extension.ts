// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { QuickPickItem } from 'vscode';

// import { DepNodeProvider, Dependency } from './nodeDependencies';
import { EntityProvider } from './EntityProvider';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

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
		let files: StringItem[] = [];
		// walkSync(path, files);
		getVhdlFileItems(path, files);

		const entityProvider = new EntityProvider(vscode.workspace.rootPath);
		vscode.window.registerTreeDataProvider('vhdlHierachy', entityProvider);

		vscode.commands.registerCommand('vhdl-hierarchy.refresh', () =>
			entityProvider.refresh()
		);


		// let disposable = vscode.commands.registerCommand('vhdl-hierarchy.setTopLevel', () => {
		// 	// The code you place here will be executed every time your command is executed

		// 	// Display a message box to the user

		// 	//  vscode.window.showQuickPick(files, { onDidAccept: handleSelectTopLEvel});
		// 	const quickpick = vscode.window.createQuickPick<StringItem>();
		// 	quickpick.items = files;



		// 	quickpick.onDidChangeSelection(items => {
		// 		vscode.window.showInformationMessage('Set top level file:  ' + items[0].label);
		// 		entityProvider.topLevelFile = items[0].base;
		// 	});
		// 	quickpick.onDidAccept(() => {
		// 		quickpick.hide();
		// 		vscode.commands.executeCommand('vhdl-hierarchy.analyze');
		// 	});
		// 	quickpick.show();


		// });
		// context.subscriptions.push(disposable);

		// context.subscriptions.push(
		vscode.commands.registerCommand('vhdl-hierarchy.analyze', () => entityProvider.analyze());

		vscode.commands.executeCommand('vhdl-hierarchy.analyze');




	}
	else {
		console.warn("Could not start the node provider as the workspace root is empty");
	}

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json



}

class StringItem implements vscode.QuickPickItem {
	label: string;
	description?: string | undefined;

	constructor(public base: string) {
		var path = require('path');
		this.label = path.basename(base);
		// this.description = path.dirname(path.relative(base.fsPath, uri.fsPath));
	}

}

function getVhdlFileItems(dir: String, filelist: StringItem[]) {
	var path = require('path');
	var fs = require('fs'),

		files = fs.readdirSync(dir);
	filelist = filelist || [];

	files.forEach(function (file: String) {
		if (fs.statSync(path.join(dir, file)).isDirectory()) {
			filelist = getVhdlFileItems(path.join(dir, file), filelist);
		}
		else if (path.extname(file) === ".vhd") {
			filelist.push(new StringItem(path.join(dir, file)));
		}
	});
	return filelist;
}

function handleSelectTopLEvel(file: StringItem) {
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
var walkSync = function (dir: string, filelist: vscode.QuickPickItem[]) {
	var path = require('path');
	var fs = require('fs'),
		files = fs.readdirSync(dir);
	filelist = filelist || [];
	files.forEach(function (file: String) {
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
export function deactivate() { }
