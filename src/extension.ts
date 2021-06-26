import {commands,window,workspace,Selection} from 'vscode'
import type {ExtensionContext,Position} from 'vscode'

export function activate(context: ExtensionContext): void {
  const min = Math.min
  const d = console.debug.bind(console)

  // const bracketPairs = workspace.getConfiguration('bracket-select').get('bracketPairs');
  const sameLineSameBracketArr: string[] | undefined = workspace.getConfiguration('bracket-select').get('sameLineSameBracket')
  const sameLineSameBracketObj: stringIndexString = {}
  if (sameLineSameBracketArr) {
    for (let i = 0,len = sameLineSameBracketArr.length; i < len; i++) {
      sameLineSameBracketObj[sameLineSameBracketArr[i]] = sameLineSameBracketArr[i]
    }
  }

  context.subscriptions.push(commands.registerCommand('git-commits-editor.helloWorld',() => {

    const activeEditor = window.activeTextEditor
    if (activeEditor) {

      const lines = activeEditor.document.getText().split('\n')

      function selectionFromActive(active: Position) {
        const c = active.character,i = active.line,line = lines[i]
        //check for closest in line, start at left
        //for both sides
        //then the rest of the longer one

        const numberOfChars = lines.length

        const leftLen = c - 1
        const rightLen = numberOfChars - c

        const lastLeft = c - min(leftLen,rightLen) - 2

        d(lastLeft)
        let rightC = leftLen,leftC
        for (leftC = c - 1; leftC > lastLeft; leftC--) {
          console.log(line[leftC])
          console.log(line[++rightC])
        }
        console.log('====================')
        if (leftLen > rightLen) {
          while (leftC > -1) {
            console.log(line[leftC--])
          }
        } else if (rightLen > leftLen) {
          while (rightC < numberOfChars) {
            console.log(line[++rightC])
          }
        }
      }

      const selectionArr = activeEditor.selections
      const newSelectionArr: Selection[] = []
      for (let i = 0,len = selectionArr.length; i < len; i++) {
        const selection = selectionArr[i]
        const active = selection.active
        const start = selection.start
        const end = selection.end

        selectionFromActive(active)
        return

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
      // activeEditor.selections = newSelectionArr
    }

  }))
}

// #types
type stringIndexString = {
  [key: string]: string,
}