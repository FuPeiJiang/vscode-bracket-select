while (i < howManyLines) {
    c = 0,numberOfChars = lines[i].length
    while (c < numberOfChars && whiteSpaceObj[lines[i][c]]) {
        c++
    }
    if (c < numberOfChars && lines[i][c] === ')') {
        insideContinuation = false

        const cBak = c
        i--,c = lines[i].length
        const text = textFromPosToCurrent([strContiStartPos,strContiStartLine])
        everything.push({type:'StringContinuation',text:text,i1:strStartLine,c1:strStartPos,i2:i,c2:c})
        everything.push({type:'newline ) continuation',text:'\n',i1:i,c1:c})
        i++,c = cBak
        everything.push({type:'whiteSpaces ) continuation',text:lines[i].slice(0,c),i1:i,c1:0,c2:c})
        everything.push({type:') continuation',text:')',i1:i,c1:c})

        c++
        strStartPos = c,strStartLine = i
        return findClosingQuoteInLine()
    }
    i++
}