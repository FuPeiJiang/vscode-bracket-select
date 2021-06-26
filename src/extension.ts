import {commands,window,Selection} from 'vscode'
import type {ExtensionContext} from 'vscode'

export function activate(context: ExtensionContext): void {

  context.subscriptions.push(commands.registerCommand('git-commits-editor.helloWorld',() => {

    const activeEditor = window.activeTextEditor
    if (activeEditor) {

      const selectionArr = activeEditor.selections
      const newSelectionArr: Selection[] = []
      for (let i = 0,len = selectionArr.length; i < len; i++) {
        const selection = selectionArr[i]
        const active = selection.active
        const start = selection.start
        const end = selection.end
        console.log(selectionArr[i].active)

        let activeEqualStart = false
        if (active.character === start.character && active.line === start.line) {
          activeEqualStart = true //and anchor===end
        }
        let selAnchor,selActive
        if (activeEqualStart) {
          selActive = start
          selAnchor = end
        } else {
          selActive = end
          selAnchor = start
        }
        /// new Selection(anchorLine: number, anchorCharacter: number, activeLine: number, activeCharacter: number): Selection
        newSelectionArr.push(new Selection(selAnchor.line,selAnchor.character - 2,selActive.line,selActive.character + 2))
      }
      activeEditor.selections = newSelectionArr
    }

  }))
}
