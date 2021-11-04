import walker from './walker'
import * as fs from 'fs'
// https://stackoverflow.com/questions/43622337/using-import-fs-from-fs#43622386

// console.log(__dirname)

let toParse
toParse = ''

toParse =
// read(`${__dirname}/extension.ts`)
// 'if (a===b) {}'
// 'for (let i = 0, len = arr.length; i < len; i++) {  console.log(arr[i])}'
// read(`${__dirname}/../tests/WhileStatement`)
// read(`${__dirname}/../tests/types/stringIndexString`)
// read(`${__dirname}/../tests/types/stringIndexString2`)
// read(`${__dirname}/../tests/types/string`)
// read(`${__dirname}/../tests/types/arr string string`)
// read(`${__dirname}/../tests/arrow func`)
// read(`${__dirname}/../tests/label`)
// 'new Position(a,b)'
// 'lines[start.line]'
// read(`${__dirname}/../tests/else`)
// read(`${__dirname}/../tests/Destructuring assignment`)
// read(`${__dirname}/../../ahk_parser.js/src/parser/index.ts`)
// read(`${__dirname}/../tests/export default paren`)
// read(`${__dirname}/../tests/array`)
// read(`${__dirname}/../tests/var equal func`)
// read(`${__dirname}/../tests/if and`)
// read(`${__dirname}/../tests/if compare`)
// read(`${__dirname}/../tests/templateLiteral`)
read(`${__dirname}/../tests/if assign`)
// read(`${__dirname}/../tests/`)
// read(`${__dirname}/../tests/`)

const everything = walker(toParse)


console.log(everything)

function read(path) {
  return fs.readFileSync(path).toString()
}
