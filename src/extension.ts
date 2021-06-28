import {commands,window,workspace,Selection} from 'vscode'
import type {ExtensionContext} from 'vscode'

export function activate(context: ExtensionContext): void {
  const min = Math.min
  const d = console.debug.bind(console)

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
      labelEachCursor:
      for (let n = 0,len = selectionArr.length; n < len; n++) {
        const alreadyDoneObj: stringIndexBool = {}
        const selection = selectionArr[n]
        const active = selection.active
        const start = selection.start

        let activeEqualStart = false
        if (active.character === start.character && active.line === start.line) {
          activeEqualStart = true //and anchor===end
        }

        const c = active.character,i = active.line,thisLine = lines[i]
        const numberOfChars = thisLine.length

        const leftLen = c - 1
        const rightLen = numberOfChars - c

        const lastLeft = c - min(leftLen,rightLen) - 2

        let rightC = leftLen,leftC = c - 1

        //check for closest in line, start at left
        //for both sides
        //then the rest of the longer one

        labelLookForAnotherSame:
        while (true) {
          let lookingFor,c1,c2

          sameLineLabel:
          while (true) {
            for (;leftC > lastLeft; leftC--) {

              if (sameLineSameBracketObj[thisLine[leftC]] && !alreadyDoneObj[thisLine[leftC]]) {
                lookingFor = sameLineSameBracketObj[thisLine[leftC]]
                c1 = leftC
                break sameLineLabel
              } else if (sameLineSameBracketObj[thisLine[++rightC]] && !alreadyDoneObj[thisLine[rightC]]) {
                lookingFor = sameLineSameBracketObj[thisLine[rightC]]
                c2 = rightC
                break sameLineLabel
              }
            }
            break sameLineLabel
          }
          labelFoundOtherSame:
          while (true) {
            if (lookingFor) {
              let rightBak = rightC
              const leftBak = leftC
              if (c1 !== undefined) {
                while (rightC++ < numberOfChars) {
                  if (thisLine[rightC] === lookingFor) {
                    d(111)
                    c2 = rightC
                    break labelFoundOtherSame
                  }
                }
                if (++rightBak < numberOfChars && sameLineSameBracketObj[thisLine[rightBak]]) {
                  lookingFor = sameLineSameBracketObj[thisLine[rightBak]]
                  c2 = rightBak
                }
              }
              if (c2 !== undefined) {
                while (leftC-- > -1) {
                  if (thisLine[leftC] === lookingFor) {
                    d(222)
                    c1 = leftC
                    break labelFoundOtherSame
                  }
                }
              }
              alreadyDoneObj[lookingFor] = true
              rightC = rightBak,leftC = leftBak
              continue labelLookForAnotherSame
            }
            continue labelEachCursor
          }
          if (activeEqualStart) {
            newSelectionArr.push(new Selection(i,c2 as number,i,c1 as number + 1))
          } else {
            newSelectionArr.push(new Selection(i,c1 as number + 1,i,c2 as number))
          }
          break labelLookForAnotherSame
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
type stringIndexBool = {
  [key: string]: boolean,
}