'use strict';
// FLUID 3D Studio - local-only, dependency-free Node.js user interface.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const crypto = require('node:crypto');
const ROOT = __dirname;
const OUTPUT = path.join(ROOT, 'outputs');
const HOST = '127.0.0.1';
const PORT = Number(process.env.FLUID_PORT || 8789);
const MAX_BODY = 25 * 1024 * 1024;
fs.mkdirSync(OUTPUT, { recursive:true });
let job = {state:'idle',message:'Listo. Ningún modelo se descarga automáticamente.',run:null,files:[],logs:[]};
function json(res,code,data){res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data));}
function mime(file){return ({'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.glb':'model/gltf-binary','.stl':'model/stl','.obj':'text/plain; charset=utf-8','.json':'application/json; charset=utf-8'})[path.extname(file).toLowerCase()]||'application/octet-stream';}
function serve(res,file){fs.stat(file,(e,s)=>{if(e||!s.isFile())return json(res,404,{error:'Archivo no encontrado'});res.writeHead(200,{'Content-Type':mime(file),'Content-Length':s.size,'X-Content-Type-Options':'nosniff','Cache-Control':'no-cache'});fs.createReadStream(file).pipe(res);});}
function readBody(req){return new Promise((resolve,reject)=>{let chunks=[],n=0;req.on('data',c=>{n+=c.length;if(n>MAX_BODY){reject(new Error('El archivo supera 25 MB.'));req.destroy();}else chunks.push(c);});req.on('end',()=>{try{resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')))}catch(e){reject(new Error('JSON no válido.'))}});req.on('error',reject);});}
function execSimple(exe,args,timeout=3500){try{const r=cp.spawnSync(exe,args,{encoding:'utf8',timeout,windowsHide:true});return r.status===0?((r.stdout||'').trim()):null;}catch{return null;}}
function modelConfig(){const fp=path.join(ROOT,'engine','config.json');try{return JSON.parse(fs.readFileSync(fp,'utf8').replace(/^\uFEFF/,''))}catch{return {python:'python',hunyuan_repo:'',hunyuan_model_dir:'',trellis_repo:'',trellis_model_dir:''}}}
function readInstallerState(){try{return JSON.parse(fs.readFileSync(path.join(ROOT,'engine','estado_instalacion.json'),'utf8').replace(/^\uFEFF/,''));}catch{return {status:'not_installed'}}}
function preflight(){let conf=modelConfig(),py=conf.python||'python';const python=execSimple(py,['--version'],4000)||execSimple('py',['-3','--version'],4000);const smi = ['nvidia-smi',path.join(process.env.WINDIR||'C:\\Windows','System32','nvidia-smi.exe'),path.join(process.env.ProgramFiles||'C:\\Program Files','NVIDIA Corporation','NVSMI','nvidia-smi.exe')];const gpu=smi.map(g=>execSimple(g,['--query-gpu=name,memory.total','--format=csv,noheader'],4500)).find(Boolean)||null;let hints=[];if(!python)hints.push('Python no detectado; no afecta al visor ni a la prueba geométrica.');if(!gpu)hints.push('No se pudo leer la GPU con nvidia-smi en este entorno.');if(!conf.hunyuan_repo||!fs.existsSync(conf.hunyuan_repo))hints.push('La ruta del repositorio Hunyuan no está configurada o no existe.');if(!conf.hunyuan_model_dir||!fs.existsSync(path.join(conf.hunyuan_model_dir,'hunyuan3d-dit-v2-mini','model.fp16.safetensors')))hints.push('Faltan pesos Hunyuan. Ejecuta INSTALAR_Y_ABRIR.bat para completar la instalación.');return {node:process.version,python,gpu,installer_status:readInstallerState().status,installer_error:readInstallerState().detalle||'',hunyuan_repo_ready:!!(conf.hunyuan_repo&&fs.existsSync(conf.hunyuan_repo)),hunyuan_weights_ready:!!(conf.hunyuan_model_dir&&fs.existsSync(path.join(conf.hunyuan_model_dir,'hunyuan3d-dit-v2-mini','model.fp16.safetensors'))),trellis_repo_ready:!!(conf.trellis_repo&&fs.existsSync(conf.trellis_repo)),trellis_weights_ready:!!(conf.trellis_model_dir&&fs.existsSync(conf.trellis_model_dir)),hints};}
function runDemo(){
  // Test artifact is intentionally an abstract cube, NOT an AI-generated shoe.
  const v=[[-.04,-.04,-.04],[.04,-.04,-.04],[.04,.04,-.04],[-.04,.04,-.04],[-.04,-.04,.04],[.04,-.04,.04],[.04,.04,.04],[-.04,.04,.04]];
  const f=[[0,2,1],[0,3,2],[4,5,6],[4,6,7],[0,1,5],[0,5,4],[1,2,6],[1,6,5],[2,3,7],[2,7,6],[3,0,4],[3,4,7]];
  const buf=Buffer.alloc(v.length*12+f.length*6); v.forEach((p,i)=>p.forEach((x,j)=>buf.writeFloatLE(x,i*12+j*4))); const off=v.length*12;
  f.flat().forEach((idx,i)=>buf.writeUInt16LE(idx,off+i*2));
  const gltf={asset:{version:'2.0',generator:'FLUID 3D Studio Test'},scene:0,scenes:[{nodes:[0]}],nodes:[{mesh:0}],meshes:[{primitives:[{attributes:{POSITION:0},indices:1,material:0}]}],materials:[{pbrMetallicRoughness:{baseColorFactor:[0.28,0.56,0.85,1],metallicFactor:.1,roughnessFactor:.65}}],buffers:[{byteLength:buf.length}],bufferViews:[{buffer:0,byteOffset:0,byteLength:off,target:34962},{buffer:0,byteOffset:off,byteLength:f.length*6,target:34963}],accessors:[{bufferView:0,componentType:5126,count:v.length,type:'VEC3',min:[-.04,-.04,-.04],max:[.04,.04,.04]},{bufferView:1,componentType:5123,count:f.length*3,type:'SCALAR'}]};
  let j=Buffer.from(JSON.stringify(gltf)); let jPad=(4-j.length%4)%4; let bPad=(4-buf.length%4)%4;
  let total=12+8+j.length+jPad+8+buf.length+bPad;let glb=Buffer.alloc(total);glb.write('glTF',0);glb.writeUInt32LE(2,4);glb.writeUInt32LE(total,8);glb.writeUInt32LE(j.length+jPad,12);glb.write('JSON',16);j.copy(glb,20);glb.fill(0x20,20+j.length,20+j.length+jPad);let p=20+j.length+jPad;glb.writeUInt32LE(buf.length+bPad,p);glb.write('BIN\0',p+4);buf.copy(glb,p+8);
  const glbFile=path.join(OUTPUT,'PRUEBA_CUBO_NO_IA.glb');fs.writeFileSync(glbFile,glb);
  let stl='solid prueba_no_ia\n';for(let triangle of f){const a=v[triangle[0]],b=v[triangle[1]],c=v[triangle[2]];let u=b.map((x,i)=>x-a[i]),w=c.map((x,i)=>x-a[i]),n=[u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0]],mag=Math.hypot(...n)||1;stl+=` facet normal ${n.map(x=>x/mag).join(' ')}\n outer loop\n`;for(let k of triangle)stl+=` vertex ${v[k].map(x=>x*1000).join(' ')}\n`;stl+=' endloop\n endfacet\n';}stl+='endsolid prueba_no_ia\n';fs.writeFileSync(path.join(OUTPUT,'PRUEBA_CUBO_NO_IA.stl'),stl);
  let obj='# Cubo de prueba, coordenadas en mm\n'+v.map(p=>'v '+p.map(q=>q*1000).join(' ')).join('\n')+'\n'+f.map(x=>'f '+x.map(i=>i+1).join(' ')).join('\n')+'\n';fs.writeFileSync(path.join(OUTPUT,'PRUEBA_CUBO_NO_IA.obj'),obj);
  job={state:'demo',message:'Prueba geométrica local completada. NO se utilizó IA ni se generó un zapato.',run:null,files:['PRUEBA_CUBO_NO_IA.glb','PRUEBA_CUBO_NO_IA.stl','PRUEBA_CUBO_NO_IA.obj'],logs:[]};return job;
}
function addLog(s){job.logs.push(String(s).slice(0,600));if(job.logs.length>70)job.logs.shift();}
function runAI(data){
  if(job.state==='running') throw new Error('Ya existe una generación en curso.');
  const cfg=modelConfig(),mode=data.engine||'hunyuan';if(!['hunyuan','trellis'].includes(mode))throw new Error('Motor no permitido.');
  const ready=mode==='hunyuan'?(cfg.hunyuan_repo&&fs.existsSync(cfg.hunyuan_repo)&&cfg.hunyuan_model_dir&&fs.existsSync(path.join(cfg.hunyuan_model_dir,'hunyuan3d-dit-v2-mini','model.fp16.safetensors'))):(cfg.trellis_repo&&fs.existsSync(cfg.trellis_repo)&&cfg.trellis_model_dir&&fs.existsSync(cfg.trellis_model_dir));
  if(!ready)throw new Error(`El motor ${mode} no está instalado y configurado. Ejecuta INSTALAR_Y_ABRIR.bat. No se descargarán modelos al generar.`);
  if(mode==='hunyuan' && readInstallerState().status!=='ready')throw new Error('La instalación IA no está verificada. Ejecuta INSTALAR_Y_ABRIR.bat; revisa instalador/instalacion.log si falla.');
  if(typeof data.image!=='string'||!/^data:image\/(png|jpeg);base64,/.test(data.image))throw new Error('Sube una imagen PNG o JPG y recórtala.');
  const b=Buffer.from(data.image.split(',')[1],'base64');if(!b.length||b.length>15*1024*1024)throw new Error('Imagen vacía o demasiado grande.');
  const ext=data.image.startsWith('data:image/png')?'png':'jpg';const id=crypto.randomBytes(5).toString('hex');const dir=path.join(OUTPUT,'job_'+id);fs.mkdirSync(dir,{recursive:true});const imagepath=path.join(dir,'entrada.'+ext);fs.writeFileSync(imagepath,b);
  job={state:'running',message:`Inicializando ${mode}. Los modelos deben estar instalados previamente.`,run:id,files:[],logs:[]};
  const py=cfg.python||'python';const script=path.join(ROOT,'engine','worker.py'); const args=[script,'--engine',mode,'--input',imagepath,'--output',dir,'--length-mm',String(Math.max(30,Math.min(600,Number(data.length_mm)||322))),'--steps',String(Math.max(10,Math.min(40,Number(data.steps)||25))),'--repo',mode==='hunyuan'?cfg.hunyuan_repo:cfg.trellis_repo,'--model-dir',mode==='hunyuan'?cfg.hunyuan_model_dir:cfg.trellis_model_dir];
  const child=cp.spawn(py,args,{cwd:ROOT,windowsHide:true,env:{...process.env,HF_HUB_OFFLINE:'1',TRANSFORMERS_OFFLINE:'1',HF_HUB_DISABLE_TELEMETRY:'1'},stdio:['ignore','pipe','pipe']});
  let err='';child.stdout.on('data',c=>{const str=c.toString();str.split(/\r?\n/).filter(Boolean).forEach(s=>{if(s.startsWith('FLUID_PROGRESS:'))job.message=s.slice(15).trim();addLog(s)})});
  child.stderr.on('data',c=>{let s=c.toString();err=(err+s).slice(-3500);addLog(s)});
  child.on('error',e=>{job.state='error';job.message='No se pudo iniciar Python: '+e.message;});
  child.on('close',code=>{if(job.state!=='running')return;if(code!==0){job.state='error';job.message='Error del motor. Revisa el registro. '+err.slice(-700);return;}
    const list=fs.readdirSync(dir).filter(f=>/\.(glb|stl|obj|json)$/i.test(f)).map(f=>'job_'+id+'/'+f);
    if(!list.some(f=>f.endsWith('.glb'))){job.state='error';job.message='El proceso terminó sin producir GLB.';return;}
    job.state='complete';job.message='Generación completada. Es una malla conceptual, no un CAD anatómico validado.';job.files=list;
  });return job;
}
const server=http.createServer(async(req,res)=>{try{
 const u=new URL(req.url,'http://localhost');const p=u.pathname;
 if(req.method==='GET'&&p==='/api/preflight')return json(res,200,preflight());
 if(req.method==='GET'&&p==='/api/state')return json(res,200,job);
 if(req.method==='POST'&&p==='/api/smoke')return json(res,200,runDemo());
 if(req.method==='POST'&&p==='/api/generate')return json(res,200,runAI(await readBody(req)));
 if(req.method==='GET'&&p.startsWith('/files/')){
   const rel=decodeURIComponent(p.slice(7));const full=path.resolve(OUTPUT,rel);
   if(!full.startsWith(OUTPUT+path.sep))return json(res,403,{error:'Acceso no permitido'});
   if(!/\.(glb|stl|obj|json)$/i.test(full))return json(res,403,{error:'Extensión no admitida'});
   if(u.searchParams.has('download'))res.setHeader('Content-Disposition','attachment; filename="'+path.basename(full).replace(/[^a-zA-Z0-9_.-]/g,'_')+'"');
   return serve(res,full);
 }
 const lookup={'/':path.join(ROOT,'public','index.html'),'/app.js':path.join(ROOT,'public','app.js'),'/style.css':path.join(ROOT,'public','style.css'),'/assets/referencia_lateral_sin_logos.png':path.join(ROOT,'assets','referencia_lateral_sin_logos.png')};
 if(req.method==='GET'&&lookup[p])return serve(res,lookup[p]);return json(res,404,{error:'Ruta no encontrada'});
}catch(e){return json(res,400,{error:e.message||String(e)})}});
if(require.main===module){
 server.on('error',err=>{console.error('No se pudo iniciar FLUID: '+err.message);process.exitCode=1;});
 server.listen(PORT,HOST,()=>{
   const url='http://'+HOST+':'+PORT;console.log('FLUID 3D Studio en '+url);
   if(process.platform==='win32'&&process.env.FLUID_NO_BROWSER!=='1'){
     try{cp.exec('start "" "'+url+'"',{windowsHide:true},()=>{});}catch(e){console.log('Abre manualmente '+url)}
   }
 });
}
module.exports={server,runDemo,preflight};
