switch (lines[i][c]) {
case '}'   :  {
    // d(`} Function DEFINITION ${char()}`)
    everything.push({type:'} unknown',text:'}',i1:i,c1:c})
    c++
    if (!skipThroughEmptyLines()) { break startOfLineLoop }
    continue startOfLineLoop
}
case '{':
    everything.push({type:'perhaps { namedIf',text:'{',i1:i,c1:c})
    c++
    if (!skipThroughEmptyLines()) { break startOfLineLoop }


default:
    console.log("lol")


}
