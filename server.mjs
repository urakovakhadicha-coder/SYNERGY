import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('./public/',import.meta.url));
const port=Number(process.env.PORT||3000);
if(!Number.isInteger(port)||port<1||port>65535)throw new Error('Invalid PORT');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.ico':'image/x-icon','.woff2':'font/woff2'};
const server=http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'});res.end();return;}
  try{
    const url=new URL(req.url,'http://localhost');
    let requested;
    try{requested=decodeURIComponent(url.pathname);}catch{res.writeHead(400);res.end('Bad request');return;}
    if(requested.includes('\0')||requested.includes('\\')||requested.split('/').some(s=>s.startsWith('.'))){res.writeHead(400);res.end('Bad request');return;}
    let file=path.resolve(root,'.'+requested);
    if(file!==path.resolve(root)&&!file.startsWith(root)){res.writeHead(403);res.end('Forbidden');return;}
    let status=200;
    try{
      const stat=await fs.stat(file);
      if(stat.isDirectory()){
        if(!url.pathname.endsWith('/')){res.writeHead(308,{'Location':url.pathname+'/'+url.search});res.end();return;}
        file=path.join(file,'index.html');
      }
      const real=await fs.realpath(file);
      if(!real.startsWith(root))throw new Error('Outside public directory');
      file=real;
      if(!(await fs.stat(file)).isFile())throw new Error('Not a file');
    }catch{file=path.join(root,'404.html');status=404;}
    const body=await fs.readFile(file);
    res.writeHead(status,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Content-Length':body.length,'Cache-Control':path.extname(file)==='.html'||status!==200?'no-cache':'public, max-age=3600'});
    res.end(req.method==='HEAD'?undefined:body);
  }catch{res.writeHead(500);res.end('Server error');}
});
server.listen(port,'0.0.0.0',()=>console.log(`Synergy listening on port ${port}`));
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>{server.close(()=>process.exit(0));setTimeout(()=>process.exit(0),10000).unref();});
