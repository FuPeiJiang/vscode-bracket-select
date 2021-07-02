
import * as util from 'util'

import * as fs from 'fs'
import {parse} from '@typescript-eslint/typescript-estree'

// console.log(__dirname + __filename)
console.log(1 + 1)

// const parsed = parse(fs.readFileSync(__filename).toString(),{ecmaVersion:2020,sourceType:'module'})
// const parsed = parse('"hello"',{ecmaVersion:2020})
// const parsed = parse('1+1',{ecmaVersion:2020})
// const parsed = parse(`function foo() {
// }`,{ecmaVersion:2020})
// const parsed = parse('{}',{ecmaVersion:2020})
const parsed = parse('v={a:{}}',{ecmaVersion:2020,loc:true,range:true})
// const parsed = parse('v=``',{ecmaVersion:2020})
// BlockStatement
// TemplateLiteral
// TemplateElement

// ObjectExpression
console.log(util.inspect(parsed,{showHidden:false,depth:null}))
