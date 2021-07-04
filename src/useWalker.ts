import walker from './walker'
import * as fs from 'fs'
// https://stackoverflow.com/questions/43622337/using-import-fs-from-fs#43622386


// console.log(__dirname)


// const everything = walker(fs.readFileSync(`${__dirname}/extension.ts`).toString())
// const everything = walker('if (a===b) {}')
// const everything = walker('for (let i = 0, len = arr.length; i < len; i++) {  console.log(arr[i])}')
const everything = walker(fs.readFileSync(`${__dirname}/../tests/WhileStatement`).toString())
console.log(everything)

