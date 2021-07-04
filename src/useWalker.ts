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
read(`${__dirname}/../tests/types/stringIndexString2`)
// read(`${__dirname}/../tests/types/string`)
// read(`${__dirname}/../tests/types/arr string string`)

const everything = walker(toParse)

console.log(everything)

function read(path) {
  return fs.readFileSync(path).toString()
}
