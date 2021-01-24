// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { QuickPickItem } from 'vscode';

import { EntityProvider } from './EntityProvider';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	const entityProvider = new EntityProvider();
	vscode.window.registerTreeDataProvider('vhdlHierachy', entityProvider);

	vscode.commands.registerCommand('vhdl-hierarchy.refresh', () => entityProvider.refresh());

	vscode.commands.registerCommand('vhdl-hierarchy.analyze', () => entityProvider.analyze());

	vscode.commands.registerCommand('vhdl-hierarchy.createDot', () => entityProvider.createDot());

	vscode.commands.executeCommand('vhdl-hierarchy.analyze');

}


// this method is called when your extension is deactivated
export function deactivate() { }
