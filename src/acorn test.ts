import * as acorn from 'acorn'

import * as util from 'util'

import * as fs from 'fs'
// console.log(__dirname + __filename)
console.log(1 + 1)

let parsed

// parsed = acorn.parse(fs.readFileSync(__filename).toString(),{ecmaVersion:2020,sourceType:'module'})
// parsed = acorn.parse('"hello"',{ecmaVersion:2020})
// parsed = acorn.parse('1+1',{ecmaVersion:2020})
// parsed = acorn.parse(`function foo() {
// }`,{ecmaVersion:2020})
// parsed = acorn.parse('{}',{ecmaVersion:2020})
// parsed = acorn.parse('v={}',{ecmaVersion:2020})
// parsed = acorn.parse('v=``',{ecmaVersion:2020})
// BlockStatement
// TemplateLiteral
// TemplateElement

// ObjectExpression
console.log(util.inspect(parsed,{showHidden:false,depth:null}))
