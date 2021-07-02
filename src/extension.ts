import {commands,window,workspace,Selection} from 'vscode'
import type {ExtensionContext} from 'vscode'

export function activate(context: ExtensionContext): void {
  const min = Math.min
  function d(...text: (any)[]) {
    console.debug(...text)
  }
  function e(...text: (any)[]) {
    //hgello
  }

  const bracketPairsArr: string[] | undefined = workspace.getConfiguration('vscode-bracket-select').get('bracketPairs')
  const sameLineStringArr: string[] | undefined = workspace.getConfiguration('vscode-bracket-select').get('sameLineString')
  const multiLineStringArr: string[] | undefined = workspace.getConfiguration('vscode-bracket-select').get('multiLineString')

  const anyLeftObj: stringIndexString = {}

  const tokensArrArr = [bracketPairsArr,sameLineStringArr,multiLineStringArr]
  for (let n = 0,len = tokensArrArr.length; n < len; n++) {
    const somethingArr = tokensArrArr[n]
    if (somethingArr) {
      for (let i = 0,len = somethingArr.length; i < len; i++) {
        const pairArr = somethingArr[i]
        anyLeftObj[pairArr[0]] = pairArr[1]
      }
    }
  }

  context.subscriptions.push(commands.registerCommand('vscode-bracket-select.helloWorld',async() => {

    const activeEditor = window.activeTextEditor
    if (activeEditor) {

      const lines = activeEditor.document.getText().split('\n')
      const howManyLinesMinusOne = lines.length - 1
      const lastLineNumberOfChars = lines[howManyLinesMinusOne].length

      const selectionArr = activeEditor.selections
      const newSelectionArr: Selection[] = []
      labelEachCursor:
      for (let n = 0,len = selectionArr.length; n < len; n++) {

        // const selection = selectionArr[n]
        const selection = activeEditor.selection
        const active = selection.active
        const start = selection.start
        const end = selection.end

        let activeEqualStart = false
        if (active.character === start.character && active.line === start.line) {
          activeEqualStart = true //and anchor===end
        }

        //check if already selected, expand selection to the brackets
        const leftChar = lines[start.line][start.character - 1] //-1 because there will always be a char if selection {| -> go here |{
        const rightChar = lines[end.line][end.character]
        if (anyLeftObj[leftChar]) {
          if (anyLeftObj[leftChar] === rightChar) {
            if (activeEqualStart) {
              newSelectionArr.push(new Selection(end.line,end.character + 1,start.line,start.character - 1))
            } else {
              newSelectionArr.push(new Selection(start.line,start.character - 1,end.line,end.character + 1))
            }
            continue labelEachCursor
          }
        }


        const count = 0
        while (true) {
          // count++
          await commands.executeCommand('editor.action.smartSelect.expand')

          // const selection = selectionArr[n]
          const selection = activeEditor.selection
          const active = selection.active
          const start = selection.start
          const end = selection.end

          let activeEqualStart = false
          if (active.character === start.character && active.line === start.line) {
            activeEqualStart = true //and anchor===end
          }

          if (start.line === 0 && start.character === 0 && end.line === howManyLinesMinusOne && end.character === lastLineNumberOfChars) {
            d('HELLO THERE')
            break
          }
          //check if already selected, expand selection to the brackets
          const leftChar = lines[start.line][start.character - 1] //-1 because there will always be a char if selection {| -> go here |{
          const rightChar = lines[end.line][end.character]
          if (anyLeftObj[leftChar]) {
            if (anyLeftObj[leftChar] === rightChar) {
              if (activeEqualStart) {
                newSelectionArr.push(new Selection(end.line,end.character,start.line,start.character))
              } else {
                newSelectionArr.push(new Selection(start.line,start.character,end.line,end.character))
              }
              continue labelEachCursor
            }
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
type stringIndexBool = {
  [key: string]: boolean,
}
type stringIndexNumString = {
  [key: string]: [boolean,string],
}