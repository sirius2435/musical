const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const React=require('react');const {renderToStaticMarkup}=require('react-dom/server');const {MemoryRouter}=require('react-router-dom');const apis=require('./src/apis');
async function main(){
 const requests=[];global.localStorage={getItem:()=> 'fixture-token'};global.fetch=async(url,init)=>{requests.push({url,body:JSON.parse(init.body)});return Response.json([])};
 await new apis.ListProductions('Rodgers','Golden Age','alphabetical').send();assert.equal(requests[0].url,'/api/listproductions');assert.deepEqual(requests[0].body,{keyword:'Rodgers',category:'Golden Age',sort:'alphabetical'});
 await new apis.SetFavorite('carousel',true).send();assert.deepEqual(requests[1].body,{productionId:'carousel',saved:true,userToken:'fixture-token'});assert.ok(!('userId' in requests[1].body));
 await new apis.SaveProduction({id:'test'}).send();assert.equal(requests[2].url,'/api/saveproduction');
 global.fetch=async()=>Response.json({message:'Administrator access required'},{status:403});await assert.rejects(new apis.DeleteSong('x').send(),/Administrator/);
 const source=process.env.STAGE_SOURCE_ROOT;const routes=['user','catalog','favorites'].map(s=>fs.readFileSync(path.join(source,'backend/src/main/scala/services',s,'routes',s[0].toUpperCase()+s.slice(1)+'Routes.scala'),'utf8')).join('\n');
 const registered=new Set([...routes.matchAll(/(?:api|apiWithToken|noRequest)\[(\w+)/g)].map(m=>m[1].replace(/Message$/,'').toLowerCase()));for(const [name,API] of Object.entries(apis)){assert.ok(registered.has(new API().constructor.name.toLowerCase()),'Caller lacks backend registration: '+name)}
 const pages=['Home','History','EraDetail','Productions','ProductionDetail','Music','SongDetail','Stagecraft','Auth','Account','Admin','About'];
 for(const page of pages){const Component=require('./src/pages/'+page).default;const html=renderToStaticMarkup(React.createElement(MemoryRouter,null,React.createElement(Component)));assert.ok(html.length>100,page+' rendered no useful layout');assert.ok(!html.includes('undefined'),page+' rendered undefined')}
 const {StoryCurve}=require('./src/pages/Music/components/StoryCurve');const curve=renderToStaticMarkup(React.createElement(StoryCurve));assert.match(curve,/type="range"/);assert.match(curve,/Introduction/);
 const {EntryEditor}=require('./src/pages/Admin/components/EntryEditor');const {emptyEntry}=require('./src/pages/Admin/hooks/useAdmin');const editor=renderToStaticMarkup(React.createElement(EntryEditor,{draft:emptyEntry,setDraft:()=>{},kind:'Production',eras:[],busy:false,onSave:()=>{},onCancel:()=>{}}));assert.match(editor,/Save to the archive/);
 console.log('PASS: 12 page initial renders, API name correspondence, backend search parameters, token-only identity, mutation/error transport, story slider and admin editor structure');console.log('Scope: static render + fetch mocks; not browser clicks, viewport screenshots or live HTTP/database integration');
}
main().catch(e=>{console.error(e);process.exitCode=1})
