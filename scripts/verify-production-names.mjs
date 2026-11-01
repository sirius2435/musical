// Inspect the actual Vite output: class names are part of this course's API wire protocol.
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import assert from 'node:assert/strict'
import {fileURLToPath} from 'node:url'
import ts from '../frontend/node_modules/typescript/lib/typescript.js'
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..')
const apiRoot=path.join(root,'frontend/src/apis')
const names=fs.readdirSync(apiRoot,{withFileTypes:true}).filter(e=>e.isDirectory()).flatMap(e=>fs.readdirSync(path.join(apiRoot,e.name)).filter(f=>f.endsWith('.ts')).map(f=>path.basename(f,'.ts')))
const found=new Set()
for(const file of fs.readdirSync(path.join(root,'frontend/dist/assets')).filter(f=>f.endsWith('.js'))){
 const text=fs.readFileSync(path.join(root,'frontend/dist/assets',file),'utf8')
 const ast=ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS)
 for(const statement of ast.statements){
  if(!ts.isVariableStatement(statement))continue
  for(const declaration of statement.declarationList.declarations){
   const name=declaration.name.getText(ast)
   if(!names.includes(name)||!declaration.initializer||!ts.isClassExpression(declaration.initializer))continue
   const actual=vm.runInNewContext(`class APIMessage{}; class APIWithTokenMessage{}; ${statement.getText(ast)}; new ${name}().constructor.name`)
   assert.equal(actual,name,'Production bundle changed an API wire name')
   found.add(name)
  }
 }
}
const walk = directory => fs.readdirSync(directory,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(directory,e.name)):[path.join(directory,e.name)])
const application = walk(path.join(root,'frontend/src')).filter(f=>/\.tsx?$/.test(f)).map(f=>fs.readFileSync(f,'utf8')).join('\n')
for (const name of names.filter(name=>!found.has(name))) {
 assert.ok(!new RegExp('new\\s+'+name+'\\s*\\(').test(application),'Instantiated API missing from production bundle: '+name)
}
console.log(`PASS: all ${found.size} bundled API constructor names preserved in the actual production bundle`)
