import http from 'node:http';

const PORT = Number(process.env.PORT || 8080);
const server = http.createServer((req,res)=>{
  res.writeHead(200,{'content-type':'application/json; charset=utf-8'});
  res.end(JSON.stringify({service:'Chroniques de Solenne MMO server',status:'scaffold',authoritative:true,version:'0.1.0'}));
});
server.listen(PORT,()=>console.log(`Solenne server scaffold listening on ${PORT}`));
