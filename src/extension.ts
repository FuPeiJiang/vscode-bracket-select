import {commands,window,workspace,Selection} from 'vscode'
import type {ExtensionContext} from 'vscode'

export function activate(context: ExtensionContext): void {
  const min = Math.min
  const d = console.debug.bind(console)

  // const bracketPairs = workspace.getConfiguration('vscode-bracket-select').get('bracketPairs');
  d(workspace.getConfiguration('vscode-bracket-select'))
  const sameLineSameBracketArr: string[] | undefined = workspace.getConfiguration('vscode-bracket-select').get('sameLineSameBracket')
  const sameLineSameBracketObj: stringIndexString = {}
  if (sameLineSameBracketArr) {
    for (let i = 0,len = sameLineSameBracketArr.length; i < len; i++) {
      sameLineSameBracketObj[sameLineSameBracketArr[i]] = sameLineSameBracketArr[i]
    }
  }

  context.subscriptions.push(commands.registerCommand('vscode-bracket-select.helloWorld',() => {

    const activeEditor = window.activeTextEditor
    if (activeEditor) {

      const lines = activeEditor.document.getText().split('\n')

      const selectionArr = activeEditor.selections
      const newSelectionArr: Selection[] = []
      for (let n = 0,len = selectionArr.length; n < len; n++) {
        const selection = selectionArr[n]
        const active = selection.active
        const start = selection.start

        // return

        let activeEqualStart = false
        if (active.character === start.character && active.line === start.line) {
          activeEqualStart = true //and anchor===end
        }

        const c = active.character,i = active.line,line = lines[i]
        const numberOfChars = lines.length

        const leftLen = c - 1
        const rightLen = numberOfChars - c

        const lastLeft = c - min(leftLen,rightLen) - 2

        let rightC = leftLen,leftC
        //check for closest in line, start at left
        //for both sides
        //then the rest of the longer one
        let lookingFor
        let c1,c2

        let foundSameLine = true
        sameLineLabel:
        while (true) {
          for (leftC = c - 1; leftC > lastLeft; leftC--) {

            if (sameLineSameBracketObj[line[leftC]]) {
              lookingFor = sameLineSameBracketObj[line[leftC]]
              c1 = leftC
              break sameLineLabel
            } else if (sameLineSameBracketObj[line[++rightC]]) {
              lookingFor = sameLineSameBracketObj[line[rightC]]
              c2 = rightC
              break sameLineLabel
            }
          }
          // console.log('====================')
          // if (leftLen > rightLen) {
          // while (leftC > -1) {
          // console.log(line[leftC--])
          // }
          // } else if (rightLen > leftLen) {
          // while (rightC < numberOfChars) {
          // console.log(line[++rightC])
          // }
          // }
          foundSameLine = false
          break sameLineLabel
        }
        d(lookingFor)
        d(foundSameLine)
        if (foundSameLine) {
          if (c1) {
            while (rightC < numberOfChars) {
              if (line[++rightC] === lookingFor) {
                c2 = rightC
                break
              }
            }
          } else if (c2) {
            while (leftC > -1) {
              if (line[leftC--] === lookingFor) {
                c1 = leftC
                break
              }
            }
          }
          if (activeEqualStart) {
            newSelectionArr.push(new Selection(i,c2 as number,i,c1 as number))
          } else {
            newSelectionArr.push(new Selection(i,c1 as number,i,c2 as number))
          }
        }
      }
      activeEditor.selections = newSelectionArr
    }

  }))
}

// #types
type stringIndexString = {
  [key: string]: string,
}