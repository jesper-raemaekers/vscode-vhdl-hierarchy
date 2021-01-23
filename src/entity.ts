import { emit } from 'process';
import * as vscode from 'vscode';


export class Entity extends vscode.TreeItem {
    analyzed: boolean;
    library: String;

    childEntitiesText: string[];
    childEntities: Entity[];
    filePath: string;

    type: Entity.Type;


    constructor(filePath: string) {
        super("...");
        this.analyzed = false;
        this.library = "";
        this.childEntitiesText = [];
        this.childEntities = [];
        this.filePath = filePath;
        var path = require('path');
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
            default:
                this.type = Entity.Type.Vhdl;
        }
    }

    // @ts-nocheck
    get tooltip(): string {
        if (!this.analyzed) {
            return `${this.label}-not analyzed`;
        }
        return `${this.label}-analyzed`;
    }
    // @ts-nocheck
    get description(): string {
        if (this.library !== "") {
            return "" + this.library;
        }
        return "";
    }

    // iconPath = {
    // 	light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
    // 	dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
    // };

    public readFromFile(): Promise<undefined> {
        var foo = new Promise<undefined>((resolve, reject) => {
            const readline = require('readline');
            const fs = require('fs');

            const readInterface = readline.createInterface({
                input: fs.createReadStream(this.filePath),
                output: process.stdout,
                console: false
            });

            switch (this.type) {
                case Entity.Type.Vhdl:
                    readInterface.on('line', function (this: any, line: any) { this.parseVhdlLine(line); }.bind(this));
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

    private parseVhdlLine(line: any) {
        const entityEx = /entity\s(?<entity>\w+)\sis/;
        const usedEntityEx = /\w+\s+:\s+entity\s+(?<entity_used>[a-zA-Z_.0-9]+)/;
        const usedCompEx = /component\s(?<component>\w+)/;
        var regexp = new RegExp(entityEx, 'i'), test = regexp.exec(line);
        if (test?.groups) {
            var path = require('path');
            this.label = test.groups['entity'];
            this.library = path.dirname(this.filePath).split(path.sep).pop();
            console.log("entity found:" + test.groups['entity'] + "in lib " + this.library);
        }

        var regexp2 = new RegExp(usedEntityEx, 'i'), test2 = regexp2.exec(line);
        if (test2?.groups) {
            var usedEntityName = test2.groups['entity_used'];
            if (usedEntityName.includes('.')) {
                //handle library usage
                usedEntityName = usedEntityName.split('.')[1];
            }
            this.childEntitiesText.push(usedEntityName);
            console.log("used entity found:" + usedEntityName);
        }

        var regexp3 = new RegExp(usedCompEx, 'i'), test3 = regexp3.exec(line);
        if (test3?.groups) {
            this.childEntitiesText.push(test3.groups['component']);
            console.log("used component found:" + test3.groups['component']);
        }
    }

    public findChieldEntities(list: Entity[]) {
        for (const ent of list) {
            let label = ent.label?.toString();
            if (label) {
                if (this.childEntitiesText.indexOf(label) > -1) {
                    this.childEntities.push(ent);
                }
            }
        }
    }


}

export namespace Entity {
    export enum Type {
        Vhdl,
        Qsys,

    }
}