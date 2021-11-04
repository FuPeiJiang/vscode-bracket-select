import {commands,window,workspace,Selection} from 'vscode'
import type {ExtensionContext} from 'vscode'

import walker from './walker'

import React,{useState,useEffect} from 'react'

export function activate(context: ExtensionContext): void {
    function d(...text: (any)[]) {
        console.debug(...text)
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

            // d(123)
            const everything = walker(documentText)
            // d(everything)

            labelEachCursor:
            for (let n = 0,len = selectionArr.length; n < len; n++) {

                const selection = selectionArr[n]
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

                const positionToIndex = createPositionToIndex()
                const index = positionToIndex(active.line,active.character)
                let goodIndex
                for (let i = 0,len = everything.length; i < len; i++) {
                    if (index > everything[i][1]) {
                        if (index < everything[i][2]) {
                            goodIndex = i
                        }
                        continue
                    }
                    break
                }
                if (goodIndex !== undefined) {
                    const [startLine,startChar] = indexToPosition(everything[goodIndex][1] + 1)
                    const [endLine,endChar] = indexToPosition(everything[goodIndex][2] - 1)
                    newSelectionArr.push(new Selection(startLine,startChar,endLine,endChar))
                } else {
                    newSelectionArr.push(selection)
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
