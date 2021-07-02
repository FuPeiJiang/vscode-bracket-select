import {commands,window,workspace,Selection,Position} from 'vscode'
import type {ExtensionContext} from 'vscode'

import * as acorn from 'acorn'
import * as walk from 'acorn-walk'
import {parse} from '@typescript-eslint/typescript-estree'

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

      const documentText = activeEditor.document.getText()

      const totalChars = documentText.length

      const lines = documentText.split('\n')

      const howManyLinesMinusOne = lines.length - 1
      const lastLineNumberOfChars = lines[howManyLinesMinusOne].length

      const selectionArr = activeEditor.selections
      const newSelectionArr: Selection[] = []

      const linesLenPlusNewline: number[] = []
      for (let i = 0,len = lines.length; i < len; i++) {
        linesLenPlusNewline.push(lines[i].length + 1)
      }
      linesLenPlusNewline[howManyLinesMinusOne]--

      function indexToPosition(index: number) {
        if (index > totalChars) {
          return [howManyLinesMinusOne,lastLineNumberOfChars]
        }
        index++
        let idxAt = 0
        for (let i = 0,len = linesLenPlusNewline.length; i < len; i++) {

          idxAt += linesLenPlusNewline[i]

          if (idxAt < index) {
            if (i !== howManyLinesMinusOne) {
              continue
            }
          }
          idxAt -= linesLenPlusNewline[i]
          return [i,index - idxAt - 1]
        }
        if (index > totalChars) {
          throw 'index>totalChars'
        }
        return [howManyLinesMinusOne,lastLineNumberOfChars]
      }
      function createPositionToIndex() {
        return (line: number,char: number) => {
          let idxAt = 0
          for (let i = 0; i < line; i++) {
            idxAt += linesLenPlusNewline[i]
          }
          idxAt += char
          return idxAt
        }
      }


      // const selection = selectionArr[n]
      const selection = activeEditor.selection
      const active = selection.active
      const start = selection.start
      const end = selection.end
      const positionToIndex = createPositionToIndex()
      const gotIndex = positionToIndex(active.line,active.character)
      d(gotIndex)
      const [startLine,startChar] = indexToPosition(gotIndex)
      d([startLine,startChar])
      const [endLine,endChar] = indexToPosition(gotIndex + 1)
      // d([startLine,startChar])
      d([endLine,endChar])
      // activeEditor.selection = new Selection(startLine,startChar,startLine,startChar + 1)
      // activeEditor.selection = new Selection(startLine,startChar - 1,startLine,startChar)
      activeEditor.selection = new Selection(startLine,startChar,endLine,endChar)
      return

      const parsed = parse(documentText,{ecmaVersion:2020,loc:true})

      d(parsed)

      walk.simple(parsed,{
      // walk.simple(acorn.parse(documentText,{ecmaVersion:2020}),{
        ObjectExpression(node) {
          d(`Found a literal: ${node.start}, ${node.end}`)
          const [startLine,startChar] = indexToPosition(node.start - 1)
          const [endLine,endChar] = indexToPosition(node.end - 1)
          // activeEditor.selections = [new Selection(startLine,startChar,startLine,startChar + 1),
          // new Selection(endLine,endChar,endLine,endChar + 1)]
          activeEditor.selection = new Selection(startLine,startChar + 1,endLine,endChar)
        },
      })
      return
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

        acorn - walk

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