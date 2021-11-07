const fs = require('fs')

const filePath = 'package.json'

const content = fs.readFileSync(filePath)
const jsonObj = JSON.parse(content)

jsonObj.main = './out/src/extension.js'

fs.writeFileSync(filePath,JSON.stringify(jsonObj,null,'\t'))
