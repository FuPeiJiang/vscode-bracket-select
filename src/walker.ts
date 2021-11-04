import {createSourceFile,Declaration,Node,ScriptTarget,SourceFile,SyntaxKind,HasJSDoc,Statement,TypeOnlyCompatibleAliasDeclaration,NamedImportBindings,Expression,ImportDeclaration} from 'typescript'

// function getStack(): NodeJS.CallSite[] | string | undefined {
// var orig = Error.prepareStackTrace
// Error.prepareStackTrace = function(_,stack) {
// return stack
// }
// var err = new Error
// Error.captureStackTrace(err,arguments.callee)
// var stack = err.stack
// Error.prepareStackTrace = orig
// return stack
// }
// function getLastLine() {
// const stack = getStack()
// if (stack === undefined || typeof stack === 'string') {
// return 'idk which line'
// }
// return stack[1].getLineNumber()
// }
function d(...text: (any)[]) {
    // node.js get which line a function was called
    // https://stackoverflow.com/questions/14172455/get-name-and-line-of-calling-function-in-node-js/14172822#53339452
    const e = new Error()
    if (e.stack === undefined) {
        console.debug(...text)
        return
    }
    const frame = e.stack.split('\n')[2] // change to 3 for grandparent func
    // const lineNumber = frame.split(':').reverse()[1]
    const functionName = frame.split(' ')[5]
    // console.log(`${functionName}:${lineNumber}`,...text)
    console.log(`${functionName}`,'➤',...text)
}

// writeSync(arrOrObjToString(everything),'everything_before.txt')
// const converted = modifyEverythingToV2(everything,false)

function HrTime_diffToMs(diff: [number,number]) {
    // d(diff)
    // return diff[0] * 1000000 + diff[1] / 1000000
    return `${diff[0] * 1000 + diff[1] / 1000000}ms`
}

export default (toParse: string): [SyntaxKind,number,number][] => {
    try {

        const everything: [SyntaxKind,number,number][] = []

        const tempArr: myNode[] = []
        // let node: any = parse(toParse,{range:true})
        // const startTime = process.hrtime()

        // type myNode = SourceFile| HasJSDoc | NamedImportBindings | Expression
        type myNode = SourceFile| HasJSDoc | Expression | NamedImportBindings
        //NamedImportBindings for tempArr.push(node.importClause.namedBindings)
        // Expression for tempArr.push(node.moduleSpecifier)

        let node: myNode = createSourceFile('',toParse,ScriptTarget.Latest,true)
        // const diff = process.hrtime(startTime)
        // d(HrTime_diffToMs(diff)) //150ms

        let subNode,subNode2

        let c1,e1,e2,c2

        let operatorIndex
        // if (c1 !== e1 && e2 !== c2) {

        // body: nodes[]
        // d(node)

        const statements = node.statements
        if (statements.length === 0) {
            return []
        }
        d(statements)

        for (let i = statements.length - 1; i > -1; i--) {
            tempArr.push(statements[i] as myNode)
        }
        node = tempArr.pop() as myNode

        outer:
        while (true) {
            // d(node)
            switch (node.kind) {
            case 'LabeledStatement':
                tempArr.push(node.body)
                break
            case SyntaxKind.StringLiteral:
                everything.push([SyntaxKind.StringLiteral,node.pos + 1,node.end])
                break
            case SyntaxKind.ImportDeclaration:
                // node | ImportDeclaration BECAUSE node can have ANY SyntaxKind, why is node even here..
                // node ISN'T HERE, it's Expression..
                tempArr.push(node.moduleSpecifier)
                if (node.importClause) {
                    if (node.importClause.namedBindings) {
                        tempArr.push(node.importClause.namedBindings)
                    }
                }
                break
            case SyntaxKind.NamedImports:
                everything.push([SyntaxKind.NamedImports,node.pos + 1,node.end])
                break
            case 'ExportNamedDeclaration':
                if (node.declaration) {
                    tempArr.push(node.declaration)
                }

                subNode = node.specifiers
                for (let i = subNode.length - 1; i > -1; i--) {
                    if (subNode[i].type === 'ExportSpecifier') {
                    //remember, this is reversed iteration
                        const e2 = subNode[i].range[1]
                        let e1
                        for (let n = 0,len = subNode.length; n < len; n++) {
                            if (subNode[n].type === 'ExportSpecifier') {
                                e1 = subNode[n].range[0]
                                break
                            }
                        }
                        everything.push(['ExportSpecifier',
                            toParse.lastIndexOf('{',e1 - 1),
                            toParse.indexOf('}',e2) + 1])
                        break
                    }
                }

                break
            case 'ExportDefaultDeclaration':
                tempArr.push(node.declaration)
                break
            case 'SequenceExpression':
                subNode = node.expressions
                for (let i = subNode.length - 1; i > -1; i--) {
                    tempArr.push(subNode[i])
                }
                break
            case 'VariableDeclaration':
                subNode = node.declarations
                for (let i = subNode.length - 1; i > -1; i--) {
                    tempArr.push(subNode[i])
                }
                break
            case 'VariableDeclarator': //Declarat{or|ion}
            // d(node)
                if (node.init) {
                    tempArr.push(node.init)
                }
                tempArr.push(node.id)
                break
            case 'Identifier':
                if (node.typeAnnotation) {
                    tempArr.push(node.typeAnnotation)
                }
                break
            case 'ObjectPattern': //let { a, b } = { a: 10, b: 20 }
                everything.push(['ObjectPattern',node.range[0],node.range[1]])
                subNode = node.properties
                for (let i = subNode.length - 1; i > -1; i--) {
                    tempArr.push(subNode[i])
                }
                break
            case 'ArrayPattern': //let [a, b] = [10, 20]
                everything.push(['ArrayPattern',node.range[0],node.range[1]])
                subNode = node.elements
                for (let i = subNode.length - 1; i > -1; i--) {
                    tempArr.push(subNode[i])
                }
                break
            case 'ExpressionStatement': //check if expressionStatement itself it wrapped in parentheses
            // d(node)
                subNode = node.expression

                c1 = node.range[0],e1 = subNode.range[0]
                ,e2 = subNode.range[1],c2 = node.range[1]
                if (c1 !== e1 && e2 !== c2) {
                    nextParen:
                    for (; c1 < e1; c1++) {
                        if (toParse[c1] === '(') {
                            while (c2-- > e2) { //3rd of for is only executed after 1st time, //bruh, just use while loop
                                if (toParse[c2] === ')') {
                                    everything.push(['ParenthesizedExpression',c1,c2 + 1])
                                    continue nextParen
                                }
                            }
                            break nextParen
                        }
                    }
                }
                // ParenthesizedExpression
                subNode = node.expression
                tempArr.push(subNode)
                break
            case 'BinaryExpression': //check if either left right is wrapped in parentheses
            case 'LogicalExpression': //wow, you can stack them : https://stackoverflow.com/questions/18412936/or-operator-in-switch-case#18412971
            // d(node)
                subNode = node.left
                operatorIndex = toParse.indexOf(node.operator,subNode.range[1])
                // d(2342343)
                // d(toParse[subNode.range[1]]) //lands on the +
                c1 = node.range[0],e1 = subNode.range[0]
                ,e2 = subNode.range[1],c2 = operatorIndex
                if (c1 !== e1 && e2 !== c2) {
                    nextParen:
                    for (; c1 < e1; c1++) {
                        if (toParse[c1] === '(') {
                            while (c2-- > e2) { //3rd of for is only executed after 1st time, //bruh, just use while loop
                                if (toParse[c2] === ')') {
                                    everything.push(['ParenthesizedExpression',c1,c2 + 1])
                                    continue nextParen
                                }
                            }
                            break nextParen
                        }
                    }
                }

                tempArr.push(node.right)

                //do the !==
                subNode = node.right
                c1 = operatorIndex + node.operator.length,e1 = subNode.range[0]
                ,e2 = subNode.range[1],c2 = node.range[1]
                if (c1 !== e1 && e2 !== c2) {
                    nextParen:
                    for (; c1 < e1; c1++) {
                        if (toParse[c1] === '(') {
                            while (c2-- > e2) { //3rd of for is only executed after 1st time, //bruh, just use while loop
                                if (toParse[c2] === ')') {
                                    tempArr.push({type:'ParenthesizedExpression',range:[c1,c2 + 1]})
                                    continue nextParen
                                }
                            }
                            break nextParen
                        }
                    }
                }

                tempArr.push(node.left)
                break
            case 'ParenthesizedExpression':
                everything.push(['ParenthesizedExpression',node.range[0],node.range[1]])
                break
            case 'AssignmentExpression':
            // d(node)
                tempArr.push(node.right,node.left)
                break
            case 'AssignmentPattern':
                tempArr.push(node.right,node.left)
                break
            case 'ObjectExpression':
                everything.push(['ObjectExpression',node.range[0],node.range[1]])
                subNode = node.properties
                for (let i = subNode.length - 1; i > -1; i--) {
                // d(subNode[i])
                    tempArr.push(subNode[i])
                }

                break
            case 'Property':
                tempArr.push(node.value,node.key)
                break
            case 'FunctionDeclaration':
                tempArr.push(node.body)
                // d('BRUH')
                // d(toParse[node.id.range[1]])
                // d(toParse[subNode.range[0] - 1])
                // d(toParse[toParse.lastIndexOf(')',subNode.range[0] - 1)])
                everything.push(['() function definition',toParse.indexOf('(',node.id.range[1])
                    ,toParse.lastIndexOf(')',node.body.range[0] - 1) + 1,
                ])

                subNode = node.params
                for (let i = subNode.length - 1; i > -1; i--) {
                    tempArr.push(subNode[i])
                }
                break
            case 'BlockStatement':
                everything.push(['BlockStatement',node.range[0],node.range[1]])
                subNode = node.body
                for (let i = subNode.length - 1; i > -1; i--) {
                    tempArr.push(subNode[i])
                }
                break
            case 'ArrayExpression':
                everything.push(['ArrayExpression',node.range[0],node.range[1]])
                subNode = node.elements
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
                everything.push(['`',node.range[0],node.range[1]])
                subNode2 = node.quasis
                subNode = node.expressions * subNode.length
                for (let i = subNode.length - 1; i > -1; i--) {
                    tempArr.push(subNode[i])
                    // d(subNode2[i])
                    tempArr.push({type:'${} TemplateLiteral',
                        range0:subNode2[i].range[1] - 1,
                        range1:subNode2[i + 1].range[0] + 1,
                    })
                }
                break
            case '${} TemplateLiteral':
                everything.push([node.type,node.range0,node.range1])
                break
            case 'IfStatement':
            // d(node)
                subNode = node.test
                c1 = node.range[0] + 2 //'if'
                ,e1 = subNode.range[0],e2 = subNode.range[1],c2 = node.consequent.range[0]
                nextParen:
                for (; c1 < e1; c1++) {
                    if (toParse[c1] === '(') {
                        while (c2-- > e2) { //3rd of for is only executed after 1st time, //bruh, just use while loop
                            if (toParse[c2] === ')') {
                                everything.push(['if ()',c1,c2 + 1])
                                continue nextParen
                            }
                        }
                        break nextParen
                    }
                }
                if (node.alternate) {
                    tempArr.push(node.alternate,node.consequent,subNode)
                } else {
                    tempArr.push(node.consequent,subNode)
                }
                break
            case 'WhileStatement':
                subNode = node.test
                c1 = node.range[0] + 5 //'while'
                ,e1 = subNode.range[0],e2 = subNode.range[1],c2 = node.body.range[0]
                nextParen:
                for (; c1 < e1; c1++) {
                    if (toParse[c1] === '(') {
                        while (c2-- > e2) { //3rd of for is only executed after 1st time, //bruh, just use while loop
                            if (toParse[c2] === ')') {
                                everything.push(['while ()',c1,c2 + 1])
                                continue nextParen
                            }
                        }
                        break nextParen
                    }
                }
                tempArr.push(node.body,subNode)
                break
            case 'ForStatement':
                c1 = node.range[0] + 3 //'for'
                ,e1 = node.init.range[0],e2 = node.update.range[1],c2 = node.body.range[0]
                nextParen:
                for (; c1 < e1; c1++) {
                    if (toParse[c1] === '(') {
                        while (c2-- > e2) { //3rd of for is only executed after 1st time, //bruh, just use while loop
                            if (toParse[c2] === ')') {
                                everything.push(['while ()',c1,c2 + 1])
                                continue nextParen
                            }
                        }
                        break nextParen
                    }
                }
                tempArr.push(node.body,node.update,node.test,node.init)
                break
            case 'SwitchStatement':
            // d(node)
                everything.push(['switch discriminant',node.discriminant.range[0],node.discriminant.range[1]])
                subNode = node.cases
                for (let i = subNode.length - 1; i > -1; i--) {
                    tempArr.push(subNode[i])
                }
                break
            case 'SwitchCase':
                subNode = node.consequent
                for (let i = subNode.length - 1; i > -1; i--) {
                    tempArr.push(subNode[i])
                }
                break
            case 'MemberExpression':
            // d(node)
                subNode = node.property
                // d(subNode)
                tempArr.push({type:'property',inside:subNode
                    ,range:[subNode.range[0] - 1,subNode.range[1] + 1],
                }
                ,node.object)
                break
            case 'property':
            // d(toParse.slice(node.range[0],node.range[1]))
            // d(toParse[node.range[0]])
            // d(toParse[node.range[1] - 1])
                if (toParse[node.range[0]] === '[' && toParse[node.range[1] - 1] === ']') {
                    everything.push(['property',node.range[0],node.range[1]])
                }
                tempArr.push(node.inside)
                break
            case 'NewExpression':
                tempArr.push({type:'arguments',theStuff:node.arguments,
                    range:[
                        toParse.indexOf('(',node.callee.range[1])
                        ,toParse.lastIndexOf(')',node.range[1] - 1),
                    ]})
                tempArr.push(node.callee)
                break
            case 'CallExpression':
            // d(node)
            // d(toParse[node.callee.range[1]])
            // d(toParse[node.range[1] - 1])
            // d(toParse[toParse.indexOf('(',node.callee.range[1])])
            // d(toParse[toParse.lastIndexOf(')',node.range[1] - 1)])
                tempArr.push({type:'arguments',theStuff:node.arguments,
                    range:[
                        toParse.indexOf('(',node.callee.range[1])
                        ,toParse.lastIndexOf(')',node.range[1] - 1),
                    ]})
                tempArr.push(node.callee)
                break
            case 'arguments':
                everything.push(['() function call or new Position()',node.range[0],node.range[1] + 1])

                subNode = node.theStuff
                for (let i = subNode.length - 1; i > -1; i--) {
                    tempArr.push(subNode[i])
                }
                break
            case 'ArrowFunctionExpression':
            //it's a definition
                subNode = node.params
                c1 = node.range[0],c2 = node.body.range[0] - 3//the arrow itself
                if (subNode.length) {
                    e1 = subNode[0].range[0]
                    ,e2 = subNode[subNode.length - 1].range[1]
                    nextParen:
                    for (; c1 < e1; c1++) {
                        if (toParse[c1] === '(') {
                            while (c2-- > e2) { //3rd of for is only executed after 1st time, //bruh, just use while loop
                                if (toParse[c2] === ')') {
                                    everything.push(['() => {} definition',c1,c2 + 1])
                                    continue nextParen
                                }
                            }
                            break nextParen
                        }
                    }
                } else {
                    everything.push(['() => {} definition',
                        toParse.indexOf('(',c1),
                        toParse.lastIndexOf(')',c2) + 1])
                }

                tempArr.push(node.body)

                for (let i = subNode.length - 1; i > -1; i--) {
                    tempArr.push(subNode[i])
                }

                break
            case 'FunctionExpression':
                tempArr.push(node.body)
                everything.push(['function() definition FunctionExpression',toParse.indexOf('(',node.range[0] + 8) //'function' is 8 characters
                    ,toParse.lastIndexOf(')',node.body.range[0] - 1) + 1,
                ])

                subNode = node.params
                for (let i = subNode.length - 1; i > -1; i--) {
                    tempArr.push(subNode[i])
                }
                break
            case 'TSTypeAliasDeclaration':
            // d(node)
                tempArr.push(node.typeAnnotation)
                break
            case 'TSTypeLiteral':
                everything.push(['TSTypeLiteral',node.range[0],node.range[1]])
                subNode = node.members
                for (let i = subNode.length - 1; i > -1; i--) {
                    tempArr.push(subNode[i])
                }
                break
            case 'TSTupleType':
                everything.push(['TSTupleType',node.range[0],node.range[1]])
                subNode = node.elementTypes
                for (let i = subNode.length - 1; i > -1; i--) {
                    tempArr.push(subNode[i])
                }
                break
            case 'TSArrayType': //trailing [] in number[]
            // d(toParse[node.elementType.range[1]])
            // d(toParse[node.range[1] - 1])
                tempArr.push({
                    type:'TSArrayType trailing []',
                    range:[ toParse.indexOf('[',node.elementType.range[1]),
                        toParse.lastIndexOf(']',node.range[1] - 1) + 1,
                    ],
                })
                tempArr.push(node.elementType)
                break
            case 'TSArrayType trailing []':
                everything.push(['TSArrayType trailing []',node.range[0],node.range[1]])
                break
            case 'TSIndexSignature':
                everything.push(['TSIndexSignature',node.range[0]
                //get index of last parameter
                    ,toParse.indexOf(']',node.parameters[node.parameters.length - 1].range[1]) + 1,
                ])
                tempArr.push(node.typeAnnotation)
                break
            case 'TSPropertySignature':
                tempArr.push(node.typeAnnotation)
                break
            case 'TSTypeAnnotation':
                tempArr.push(node.typeAnnotation)
                break
            }

            if (tempArr.length) {
                node = tempArr.pop()
                continue outer
            }
            break outer
        }
        return everything

    } catch (error) {
        d('walker error')
        d(error)
        return []

    }
}
