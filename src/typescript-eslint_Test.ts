
import * as util from 'util'

import * as fs from 'fs'
import {parse} from '@typescript-eslint/typescript-estree'

const d = console.debug.bind(console)

// const parsed = parse(fs.readFileSync(__filename).toString(),{,sourceType:'module'})
// const parsed = parse('"hello"',{})
// const parsed = parse('1+1',{})
let toParse
toParse = ''
// toParse = `function foo() {
// v={a:{}}
// }`
// toParse=`if (true) {
// }`
// toParse = `while (true) {}`
// toParse = `switch (okk) {
// case true:
// break
// case false:
// break
// }`

// toParse='{}'
// toParse='v={a:{}};v={a:{}}'
// toParse='v=[[]]'
// toParse='v=\'a\',v=2,v="\'"'
// toParse='v=`a${b}c${d}`,v=`${b}`,v=`a`,v=``'
// toParse='v=`a${b}c${d}`'
// toParse='v=`${b}`'
// toParse='v=`${{a:{}}}`'
// toParse='v=`${{a:{}}}`'

// toParse = 'v=a[2]["h"]'
toParse = 'v=a[2]'


const parsed = parse(toParse,{loc:true,range:true})

// BlockStatement
// TemplateLiteral
// TemplateElement


/* const typeToFuncObj = {'ExpressionStatement':(node)=>{
  everything.push(node.type)
  typeToFuncObj[node.type](node.expression)
},
'ExpressionStatement':(node)=>{

},

}
*/
const everything = []

const nodeArr = [parsed]
let idx = 0
const tempArr = []
let tempIdx = -1
let node = nodeArr[idx]

let subNode

outer:
while (true) {
  switch (node.type as string) {
  case 'Program':
    // body: nodes[]
    nodeArr.push(node)
    // d(node)
    subNode = node.body
    nodeArr.push(subNode)
    idx += 2
    tempIdx += subNode.length
    for (let i = subNode.length - 1; i > -1; i--) {
      tempArr.push(subNode[i])
    }
    break
  case 'SequenceExpression':
    subNode = node.expressions
    tempIdx += subNode.length
    for (let i = subNode.length - 1; i > -1; i--) {
      tempArr.push(subNode[i])
    }
    break
  case 'ExpressionStatement':
    // d(node)
    nodeArr.push(node)
    idx++
    subNode = node.expression
    tempIdx += 1
    tempArr.push(subNode)
    break
  case 'AssignmentExpression':
    tempIdx += 2
    // d(node)
    tempArr.push(node.right,node.left)
    break
  case 'ObjectExpression':
    everything.push(['ObjectExpression',node.range[0],node.range[1]])
    subNode = node.properties
    tempIdx += subNode.length
    for (let i = subNode.length - 1; i > -1; i--) {
      // d(subNode[i])
      tempArr.push(subNode[i])
    }

    break
  case 'Property':
    nodeArr.push(node)
    idx++
    tempIdx += 2
    tempArr.push(node.value,node.key)
    break
  case 'FunctionDeclaration':
    // d(node)
    subNode = node.body
    tempIdx++
    tempArr.push(subNode)
    // d('BRUH')
    // d(toParse[node.id.range[1]])
    // d(toParse[subNode.range[0] - 1])
    // d(toParse[toParse.lastIndexOf(')',subNode.range[0] - 1)])
    everything.push(['() function definition',toParse.indexOf('(',node.id.range[1])
      ,toParse.lastIndexOf(')',subNode.range[0] - 1),
    ])
    break
  case 'BlockStatement':
    everything.push(['BlockStatement',node.range[0],node.range[1]])
    subNode = node.body
    tempIdx += subNode.length
    for (let i = subNode.length - 1; i > -1; i--) {
      tempArr.push(subNode[i])
    }
    break
  case 'ArrayExpression':
    everything.push(['ArrayExpression',node.range[0],node.range[1]])
    subNode = node.elements
    tempIdx += subNode.length
    for (let i = subNode.length - 1; i > -1; i--) {
      tempArr.push(subNode[i])
    }
    break
  case 'Literal':
    const firstChar = node.raw[0]
    if (firstChar === '"') {
      everything.push(['"',node.range[0],node.range[1]])
    } else if (firstChar === '\'') {
      everything.push(['\'',node.range[0],node.range[1]])
    }
    break
  case 'TemplateLiteral':
    subNode = node.expressions
    tempIdx += subNode.length
    for (let i = subNode.length - 1; i > -1; i--) {
      tempArr.push(subNode[i])
    }
    break
  case 'IfStatement':
    // d(node)
    subNode = node.test
    everything.push(['if test',subNode.range[0],subNode.range[1]])
    tempIdx++
    tempArr.push(node.consequent)
    break
  case 'WhileStatement':
    subNode = node.body
    everything.push(['while test',subNode.range[0],subNode.range[1]])
    tempIdx++
    tempArr.push(node.consequent)
    break
  case 'SwitchStatement':
    // d(node)
    everything.push(['switch discriminant',node.discriminant.range[0],node.discriminant.range[1]])
    subNode = node.cases
    tempIdx += subNode.length
    for (let i = 0,len = subNode.length; i < len; i++) {
      tempArr.push(subNode[i])
    }
    break
  case 'SwitchCase':
    subNode = node.consequent
    tempIdx += subNode.length
    for (let i = 0,len = subNode.length; i < len; i++) {
      tempArr.push(subNode[i])
    }
    break
  case 'MemberExpression':
    d(node)
    everything.push(['BlockStatement',node.range[0],node.range[1]])

    tempArr.push(node.property,node.object)

    break
  }

  if (tempIdx !== -1) {
    tempIdx--
    node = tempArr.pop()
    continue outer
  }
  break outer
}

d(everything)

// const body = parsed.body
// for (let i = 0,len = body.length; i < len; i++) {
// console.log(body[i])
// }


// ObjectExpression
// console.log(util.inspect(parsed,{showHidden:false,depth:null}))


