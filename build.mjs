import fs from 'node:fs';
import path from 'node:path';
import {render,routes,origin} from './src/render.mjs';
import {languages} from './src/content.mjs';
for(const lang of languages) for(const route of routes){const dir=path.join('public',lang,route);fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'index.html'),render(lang,route));}
fs.writeFileSync('public/index.html',render('ru',''));
fs.writeFileSync('public/404.html',render('ru','404'));
fs.copyFileSync('src/browser.mjs','public/site.js');
fs.copyFileSync('src/logic.mjs','public/logic.mjs');
fs.writeFileSync('public/sitemap.xml','<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+languages.flatMap(l=>routes.map(r=>`<url><loc>${origin}/${l}/${r?r+'/':''}</loc></url>`)).join('')+'</urlset>');
fs.writeFileSync('public/robots.txt',`User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
console.log(`Built ${languages.length*routes.length} pages in RU, UZ and EN, plus root and 404.`);
