import ts from '../frontend/node_modules/typescript/lib/typescript.js'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import {spawnSync} from 'node:child_process'
import {fileURLToPath} from 'node:url'
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..')
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'stage-ui-test-'))
const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(p,e.name)):[path.join(p,e.name)])
try{
 fs.symlinkSync(path.join(root,'frontend/node_modules'),path.join(temp,'node_modules'),'dir')
 for(const file of walk(path.join(root,'frontend/src')).filter(p=>/\.tsx?$/.test(p)&&!p.endsWith('.d.ts'))){const rel=path.relative(path.join(root,'frontend/src'),file).replace(/\.tsx?$/,'.js');const out=path.join(temp,'src',rel);fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText)}
 fs.copyFileSync(path.join(root,'tests/frontend.cjs'),path.join(temp,'test.cjs'))
 const result=spawnSync(process.execPath,['test.cjs'],{cwd:temp,stdio:'inherit',env:{...process.env,STAGE_SOURCE_ROOT:root}})
 if(result.status!==0)process.exitCode=1
}finally{fs.rmSync(temp,{recursive:true,force:true})}
