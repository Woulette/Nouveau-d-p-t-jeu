import fs from 'node:fs';
import crypto from 'node:crypto';

const manifestPath='official/assets/generated/manifest.json';
if(!fs.existsSync(manifestPath)) throw new Error(`Manifest absent: ${manifestPath}`);
const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
const pngSignature=Buffer.from([137,80,78,71,13,10,26,10]);
const result=[];
for(const asset of manifest.atlases){
  if(!fs.existsSync(asset.file)) throw new Error(`Atlas absent: ${asset.file}`);
  const data=fs.readFileSync(asset.file);
  if(!data.subarray(0,8).equals(pngSignature)) throw new Error(`Signature PNG invalide: ${asset.file}`);
  const width=data.readUInt32BE(16),height=data.readUInt32BE(20);
  const hash=crypto.createHash('sha256').update(data).digest('hex');
  if(width!==asset.width||height!==asset.height) throw new Error(`Dimensions modifiées: ${asset.file}`);
  if(hash!==asset.sha256) throw new Error(`SHA-256 modifié: ${asset.file}`);
  if(width<128||height<64) throw new Error(`Atlas trop petit: ${asset.file}`);
  result.push({file:asset.file,width,height,bytes:data.length,sha256:hash,status:'PASS'});
}
fs.mkdirSync('tests',{recursive:true});
fs.writeFileSync('tests/asset-integrity-report.json',JSON.stringify({status:'PASS',assets:result},null,2)+'\n');
console.log(JSON.stringify(result,null,2));
