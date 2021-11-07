const fs = require('fs')

const filePath = 'package.json'

const content = fs.readFileSync(filePath)
const jsonObj = JSON.parse(content)

jsonObj.main = './dist/extension.js'

fs.writeFileSync(filePath,JSON.stringify(jsonObj,null,'\t'))
