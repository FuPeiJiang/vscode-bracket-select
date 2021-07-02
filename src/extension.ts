import {commands,window,workspace,Selection} from 'vscode'
import type {ExtensionContext} from 'vscode'

export function activate(context: ExtensionContext): void {
  const min = Math.min
  function d(...text: (any)[]) {
    console.debug(...text)
  }

  const sameLineSameBracketArr: string[] | undefined = workspace.getConfiguration('vscode-bracket-select').get('sameLineSameBracket')
  const bracketPairsArr: string[] | undefined = workspace.getConfiguration('vscode-bracket-select').get('bracketPairs')
  const sameLineStringArr: string[] | undefined = workspace.getConfiguration('vscode-bracket-select').get('sameLineString')
  const multiLineStringArr: string[] | undefined = workspace.getConfiguration('vscode-bracket-select').get('multiLineString')
  const leftBracketObj: stringIndexNumString = {}
  const rightBracketObj: stringIndexNumString = {}
  // d(sameLineStringArr,multiLineStringArr)
  const leftMultiObj: stringIndexString = {}
  const rightMultiObj: stringIndexString = {}

  const leftStringObj: stringIndexNumString = {}
  const rightStringObj: stringIndexNumString = {}

  //for "check if already selected"
  const anyLeftObj: stringIndexString = {}

  if (sameLineSameBracketArr) {
    for (let i = 0,len = sameLineSameBracketArr.length; i < len; i++) {
      leftBracketObj[sameLineSameBracketArr[i]] = [true,sameLineSameBracketArr[i]]
      rightBracketObj[sameLineSameBracketArr[i]] = [true,sameLineSameBracketArr[i]]
      anyLeftObj[sameLineSameBracketArr[i]] = sameLineSameBracketArr[i]
    }
  }
  if (bracketPairsArr) {
    for (let i = 0,len = bracketPairsArr.length; i < len; i++) {
      const pairArr = bracketPairsArr[i]
      leftMultiObj[pairArr[0]] = pairArr[1]
      rightMultiObj[pairArr[1]] = pairArr[0]
      anyLeftObj[pairArr[0]] = pairArr[1]
    }
  }
  if (sameLineStringArr) {
    for (let i = 0,len = sameLineStringArr.length; i < len; i++) {
      const pairArr = sameLineStringArr[i]
      leftStringObj[pairArr[1]] = [true,pairArr[0]]
      rightStringObj[pairArr[0]] = [true,pairArr[1]]
    }
  }
  if (multiLineStringArr) {
    for (let i = 0,len = multiLineStringArr.length; i < len; i++) {
      const pairArr = multiLineStringArr[i]
      leftStringObj[pairArr[1]] = [false,pairArr[0]]
      rightStringObj[pairArr[0]] = [false,pairArr[1]]

    }
  }
  d(leftBracketObj,rightBracketObj)
  d(leftStringObj,rightStringObj)

  context.subscriptions.push(commands.registerCommand('vscode-bracket-select.helloWorld',() => {

    const activeEditor = window.activeTextEditor
    if (activeEditor) {

      const lines = activeEditor.document.getText().split('\n')
      const howManyLines = lines.length

      const selectionArr = activeEditor.selections
      const newSelectionArr: Selection[] = []
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

        const alreadyDoneObj: stringIndexBool = {}
        let singleLine = true

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
          let found,lookingFor,c1,c2

          sameLineLabel:
          while (true) {
            let isLeftMulti: boolean
            let o1,l1,line1
              ,o2,l2,line2,numberOfChars2
            findMatchingMulti:
            while (true) {
              for (;leftC > lastLeft; leftC--) {

                if (leftBracketObj[thisLine[leftC]] && !alreadyDoneObj[thisLine[leftC]]) {
                  found = thisLine[leftC]
                  lookingFor = leftBracketObj[found][1]
                  singleLine = leftBracketObj[found][0]
                  if (singleLine) {
                    c1 = leftC
                    break sameLineLabel
                  }
                  isLeftMulti = true
                  l1 = i,o1 = leftC
                  l2 = i,o2 = rightC
                  break findMatchingMulti
                } else if (rightBracketObj[thisLine[++rightC]] && !alreadyDoneObj[thisLine[rightC]]) {
                  found = thisLine[rightC]
                  lookingFor = rightBracketObj[found][1]
                  singleLine = rightBracketObj[found][0]
                  if (singleLine) {
                    c2 = rightC
                    break sameLineLabel
                  }
                  isLeftMulti = false
                  l1 = i,o1 = leftC
                  l2 = i,o2 = rightC
                  break findMatchingMulti
                }
                d(thisLine[leftC],thisLine[rightC])
              }
              //both sides, multiline
              // o1 = leftC + 1,l1 = i,line1 = thisLine
              // ,o2 = rightC,l2 = i,line2 = thisLine,numberOfChars2 = numberOfChars

              o1 = c - 1,l1 = i,line1 = thisLine
              ,o2 = c,l2 = i,line2 = thisLine,numberOfChars2 = numberOfChars

              const leftLookingForArr = []
              let leftLastIdx = -1
              const rightLookingForArr = []
              let rightLastIdx = -1
              while (true) {
              //side left
                while (true) {
                  while (o1 === -1) {
                    if (--l1 === -1) {
                      continue labelEachCursor
                    }
                    line1 = lines[l1],o1 = line1.length - 1
                  }
                  if (leftMultiObj[line1[o1]] && !alreadyDoneObj[line1[o1]] && leftLastIdx === -1) {
                    //gonna go to -> found left, look for right
                    found = line1[o1]
                    lookingFor = leftMultiObj[found]

                    isLeftMulti = true
                    break findMatchingMulti
                  } else if (leftLastIdx !== -1 && line1[o1] === leftLookingForArr[leftLastIdx]) {
                    leftLastIdx--
                    leftLookingForArr.pop()
                  } else if (leftStringObj[line1[o1]]) {
                    const foundArr = leftStringObj[line1[o1]]
                    if (foundArr[0]) { //singleLine
                      const index = line1.lastIndexOf(foundArr[1],o1 - 1)
                      if (index !== -1) {
                        o1 = index
                      } else {
                        continue labelEachCursor
                      }
                    } else { //multiline
                      leftLastIdx++
                      leftLookingForArr.push(foundArr[1])
                    }
                  }
                  --o1
                  if (leftLastIdx === -1) {
                    break
                  }
                }

                //side right
                while (true) {
                  while (o2 === numberOfChars2) {
                    if (++l2 === howManyLines) {
                      continue labelEachCursor
                    }
                    line2 = lines[l2],numberOfChars2 = line2.length,o2 = 0
                  }
                  if (rightMultiObj[line2[o2]] && !alreadyDoneObj[line2[o2]] && rightLastIdx === -1) {
                    //gonna go to -> found right, look for left
                    found = line2[o2]
                    lookingFor = rightMultiObj[found]

                    isLeftMulti = false
                    break findMatchingMulti
                  } else if (rightLastIdx !== -1 && line2[o2] === rightLookingForArr[rightLastIdx]) {
                    rightLastIdx--
                    rightLookingForArr.pop()
                  } else if (rightStringObj[line2[o2]]) {
                    const foundArr = rightStringObj[line2[o2]]
                    if (foundArr[0]) { //singleLine
                      const index = line2.lastIndexOf(foundArr[1],o2 - 1)
                      if (index !== -1) {
                        o2 = index
                      } else {
                        continue labelEachCursor
                      }
                    } else { //multiline
                      rightLastIdx++
                      rightLookingForArr.push(foundArr[1])
                    }
                  }
                  o2++
                  if (rightLastIdx === -1) {
                    break
                  }
                }

              }

              //break sameLineLabel is being done by the above while(true)
            }
            //after break findMatchingMulti || after findMatchingMulti
            const lookingForArr = [lookingFor]
            let lastIdx = 0
            if (isLeftMulti) {
              //found left, look for right
              let l = l2,o = o2,mLine = lines[l],numberOfChars = mLine.length

              while (true) {
                while (o === numberOfChars) {
                  if (++l === howManyLines) {
                    alreadyDoneObj[found] = true
                    continue labelLookForAnotherSame
                  }
                  o = 0,mLine = lines[l],numberOfChars = mLine.length //o could be 0 so loop it again
                }
                if (mLine[o] === lookingForArr[lastIdx]) {
                  if (lastIdx === 0) {
                    d(333)
                    newSelectionArr.push(new Selection(l,o,l1,o1 + 1))
                    continue labelEachCursor
                  } else {
                    lastIdx--
                    lookingForArr.pop()
                  }
                } else if (rightStringObj[mLine[o]]) {
                  const foundArr = rightStringObj[mLine[o]]
                  if (foundArr[0]) { //singleLine
                    const index = mLine.indexOf(foundArr[1],o + 1)
                    if (index !== -1) {
                      o = index
                    } else {
                      continue labelLookForAnotherSame
                    }
                  } else { //multiline
                    lastIdx++
                    lookingForArr.push(foundArr[1])
                  }

                }
                o++
              }
            } else {
              //found right, look for left
              let l = l1,mLine = lines[l],o = o1

              while (true) {
                while (o === -1) {
                  if (--l === -1) {
                    alreadyDoneObj[found] = true
                    continue labelLookForAnotherSame
                  }
                  mLine = lines[l],o = mLine.length - 1
                }
                if (mLine[o] === lookingForArr[lastIdx]) {
                  if (lastIdx === 0) {
                    d(444)
                    newSelectionArr.push(new Selection(l2,o2,l,o + 1))
                    continue labelEachCursor
                  } else {
                    lastIdx--
                    lookingForArr.pop()
                  }
                } else if (leftStringObj[mLine[o]]) {
                  const foundArr = leftStringObj[mLine[o]]
                  if (foundArr[0]) { //singleLine
                    const index = mLine.lastIndexOf(foundArr[1],o - 1)
                    if (index !== -1) {
                      o = index
                    } else {
                      continue labelLookForAnotherSame
                    }
                  } else { //multiline
                    lastIdx++
                    lookingForArr.push(foundArr[1])
                  }
                }
                o--
              }
            }
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
                if (++rightBak < numberOfChars && rightBracketObj[thisLine[rightBak]] && !alreadyDoneObj[thisLine[rightBak]]) {
                  lookingFor = rightBracketObj[thisLine[rightBak]][1]
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
type stringIndexNumString = {
  [key: string]: [boolean,string],
}