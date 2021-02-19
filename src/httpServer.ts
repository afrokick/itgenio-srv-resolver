import http from "http";
import { Storage } from './storage';
import { log } from "./utils";

export function startHttpServer(storage: Storage, httpPort: number) {
  return http.createServer(function (req, res) {
    if (req.method !== 'GET') return res.end();

    res.setHeader("Content-Type", "application/json; charset=utf-8;");
    res.setHeader("Cache-Control", "no-store, no-cache");
    res.end(JSON.stringify({ servers: storage.servers }));
  }).listen(httpPort, () => {
    log('HttpServer: started');
  });
}