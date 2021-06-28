import {commands,window,workspace,Selection} from 'vscode'
import type {ExtensionContext} from 'vscode'

export function activate(context: ExtensionContext): void {
  const min = Math.min
  const d = console.debug.bind(console)

  const sameLineSameBracketArr: string[] | undefined = workspace.getConfiguration('vscode-bracket-select').get('sameLineSameBracket')
  const bracketPairsArr: string[] | undefined = workspace.getConfiguration('vscode-bracket-select').get('bracketPairs')
  const leftBracketObj: stringIndexNumString = {}
  const rightBracketObj: stringIndexNumString = {}

  const leftMultiObj: stringIndexString = {}
  const rightMultiObj: stringIndexString = {}
  if (sameLineSameBracketArr) {
    for (let i = 0,len = sameLineSameBracketArr.length; i < len; i++) {
      leftBracketObj[sameLineSameBracketArr[i]] = [true,sameLineSameBracketArr[i]]
      rightBracketObj[sameLineSameBracketArr[i]] = [true,sameLineSameBracketArr[i]]
    }
  }
  if (bracketPairsArr) {
    for (let i = 0,len = bracketPairsArr.length; i < len; i++) {
      const pairArr = bracketPairsArr[i]
      leftBracketObj[pairArr[0]] = [false,pairArr[1]]
      rightBracketObj[pairArr[1]] = [false,pairArr[0]]
      leftMultiObj[pairArr[0]] = pairArr[1]
      rightMultiObj[pairArr[1]] = pairArr[0]
    }
  }
  d(leftBracketObj,rightBracketObj)

  context.subscriptions.push(commands.registerCommand('vscode-bracket-select.helloWorld',() => {

    const activeEditor = window.activeTextEditor
    if (activeEditor) {

      const lines = activeEditor.document.getText().split('\n')
      const howManyLines = lines.length

      const selectionArr = activeEditor.selections
      const newSelectionArr: Selection[] = []
      labelEachCursor:
      for (let n = 0,len = selectionArr.length; n < len; n++) {
        const alreadyDoneObj: stringIndexBool = {}
        let singleLine = true

        const selection = selectionArr[n]
        const active = selection.active
        const start = selection.start

        let activeEqualStart = false
        if (active.character === start.character && active.line === start.line) {
          activeEqualStart = true //and anchor===end
        }

        const c = active.character,i = active.line,thisLine = lines[i]
        const numberOfChars = thisLine.length

        const leftLen = c
        const rightLen = numberOfChars - c
        d(leftLen,rightLen)

        let rightC = c - 1,leftC = rightC
        const lastLeft = leftC - min(leftLen,rightLen)


        //check for closest in line, start at left
        //for both sides
        //then the rest of the longer one

        labelLookForAnotherSame:
        while (true) {
          let lookingFor,c1,c2,i1,i2

          sameLineLabel:
          while (true) {
            for (;leftC > lastLeft; leftC--) {

              if (leftBracketObj[thisLine[leftC]] && !alreadyDoneObj[thisLine[leftC]]) {
                lookingFor = leftBracketObj[thisLine[leftC]][1]
                c1 = leftC,i1 = i
                singleLine = leftBracketObj[thisLine[leftC]][0]
                break sameLineLabel
              } else if (rightBracketObj[thisLine[++rightC]] && !alreadyDoneObj[thisLine[rightC]]) {
                lookingFor = rightBracketObj[thisLine[rightC]][1]
                c2 = rightC,i2 = i
                singleLine = rightBracketObj[thisLine[rightC]][0]
                break sameLineLabel
              }
              d(thisLine[leftC],thisLine[rightC])
            }
            //both sides, multiline
            let o1 = leftC,l1 = i,line1 = thisLine
            if (o1 === -1) {
              l1 = i - 1
              if (l1 === -1) {
                continue labelEachCursor
              }
              line1 = lines[l1],o1 = line1.length
            }
            let o2 = rightC,l2 = i,line2 = thisLine,numberOfChars2 = numberOfChars
            while (true) {
              if (--o1 > -1) {
                if (leftMultiObj[line1[o1]] && !alreadyDoneObj[line1[o1]]) {
                  lookingFor = leftMultiObj[line1[o1]]
                  c1 = o1,i1 = l1
                  singleLine = false
                  break sameLineLabel
                }
              } else {
                if (++l1 as number === -1) {
                  continue labelEachCursor
                }
                line1 = lines[l1],o1 = line1.length
              }
              if (++o2 < numberOfChars2) {
                if (rightMultiObj[line2[o2]] && !alreadyDoneObj[line2[o2]]) {
                  lookingFor = rightMultiObj[line2[o2]]
                  c2 = rightC,i2 = l2
                  singleLine = false
                  break sameLineLabel
                }
              } else {
                if (++l2 === howManyLines) {
                  continue labelEachCursor
                }
                line2 = lines[l2],numberOfChars2 = line2.length,o2 = 0
              }
            }
            //break sameLineLabel is being done by the above while(true)
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
                if (singleLine) {
                  if (++rightBak < numberOfChars && rightBracketObj[thisLine[rightBak]] && !alreadyDoneObj[thisLine[rightBak]]) {
                    lookingFor = rightBracketObj[thisLine[rightBak]][1]
                    c2 = rightBak
                  }
                } else {
                  let l = i,o
                  while (++l < howManyLines) {
                    const mLine = lines[l]
                    const howManyChars = mLine.length
                    o = 0
                    while (o < howManyChars) {
                      if (mLine[o] === lookingFor) {
                        d(11111111111111111111111111)
                        newSelectionArr.push(new Selection(l,o,i1 as number,c1 + 1))
                        continue labelEachCursor
                      }
                      o++
                    }
                  }
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
                if (!singleLine) {
                  let l = i,o
                  while (--l > -1) {
                    const mLine = lines[l]
                    o = mLine.length
                    while (--o > -1) {
                      if (mLine[o] === lookingFor) {
                        d(22222222222222222222222222)
                        newSelectionArr.push(new Selection(i2 as number,c2,l,o + 1))
                        continue labelEachCursor
                      }
                    }
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
type stringIndexNumString = {
  [key: string]: [boolean,string],
}