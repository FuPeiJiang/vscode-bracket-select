import * as vscode from 'vscode'

export function activate(context: vscode.ExtensionContext) {

  console.log('Congratulations, your extension "git-commits-editor" is now active!')


  context.subscriptions.push(vscode.commands.registerCommand('git-commits-editor.helloWorld', () => {

    vscode.window.showInformationMessage('Hello World from git-commits-editor!')
  }))
}

// this method is called when your extension is deactivated
export function deactivate() {}
