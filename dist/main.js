var __create = Object.create;
var __defProp = Object.defineProperty;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
var __exportStar = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, {get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable});
  }
  return target;
};
var __toModule = (module2) => {
  if (module2 && module2.__esModule)
    return module2;
  return __exportStar(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", {value: module2, enumerable: true})), module2);
};

// src/index.ts
var import_process = __toModule(require("process"));

// src/config.ts
var TIMEOUT = Number(process.env.TIMEOUT) || 2500;
var PING_INTERVAL = Number(process.env.PING_INTERVAL) || 3e3;
var RESOLVER_SERVER = process.env.RESOLVER_SERVER || "8.8.8.8";
var HTTP_PORT = Number(process.env.HTTP_PORT) || 5e3;
var SRV_RECORD = process.env.SRV_RECORD;

// src/httpServer.ts
var import_http = __toModule(require("http"));

// src/utils.ts
function t() {
  return new Date().getTime();
}
var formatNow = () => {
  const d = new Date();
  const date = d.toLocaleDateString("ru");
  const time = d.toLocaleTimeString("ru");
  const ms = `${d.getTime() % 1e3}`.padStart(3, "0");
  return `${date} ${time}.${ms}`;
};
function log(...args) {
  console.log(`[${formatNow()}]`, ...args);
}
function error(...args) {
  console.error(`[${formatNow()}]`, ...args);
}
function wait(ms) {
  return new Promise((res) => {
    setTimeout(() => res(), ms);
  });
}

// src/httpServer.ts
function startHttpServer(storage2, httpPort) {
  return import_http.default.createServer(function(req, res) {
    if (req.method !== "GET")
      return res.end();
    res.setHeader("Content-Type", "application/json; charset=utf-8;");
    res.setHeader("Cache-Control", "no-store, no-cache");
    res.end(JSON.stringify({servers: storage2.servers}));
  }).listen(httpPort, () => {
    log("HttpServer: started");
  });
}

// src/pinger.ts
var import_dns = __toModule(require("dns"));
var import_net = __toModule(require("net"));
var resolver = new import_dns.promises.Resolver();
resolver.setServers([RESOLVER_SERVER]);
async function ping(ip, port) {
  return new Promise((res, rej) => {
    const sock = new import_net.default.Socket();
    sock.setTimeout(TIMEOUT);
    sock.on("connect", function() {
      res();
      sock.destroy();
    }).on("error", function(e) {
      rej(e);
    }).on("timeout", function(e) {
      rej(e);
    }).connect(+port, ip);
  });
}
async function fillWithPing(address) {
  try {
    const st = t();
    await ping(address.name, address.port);
    return {...address, ping: t() - st};
  } catch (e) {
    return {...address, error: e.toString()};
  }
}
async function startPing(storage2, srvRecord) {
  log(`Pinger: started`);
  while (true) {
    try {
      const addresses = await resolver.resolveSrv(srvRecord);
      const filledAddresses = await Promise.all(addresses.map((address) => fillWithPing(address)));
      storage2.servers = filledAddresses;
      filledAddresses.forEach((address) => {
        if ("error" in address) {
          error(`Pinger: Address ${address.name}:${address.port} has error: ${address.error}`);
        }
      });
    } catch (e) {
      error(`Pinger: ${e.toString()}`);
    }
    await wait(PING_INTERVAL);
  }
}

// src/storage.ts
var Storage = class {
  constructor() {
    this.servers = [];
  }
};

// src/index.ts
var storage = new Storage();
async function main() {
  if (!SRV_RECORD) {
    console.error(`You need to pass SRV_RECORD env`);
    import_process.exit(1);
  }
  log(`Running app ...
######################
#### Start server ####
######################
with config:
SRV_RECORD(required): ${SRV_RECORD}
TIMEOUT: ${TIMEOUT}
PING_INTERVAL: ${PING_INTERVAL}
RESOLVER_SERVER: ${RESOLVER_SERVER}
HTTP_PORT: ${HTTP_PORT}
######################`);
  try {
    const server = startHttpServer(storage, HTTP_PORT);
    process.on("SIGINT", function() {
      server.close();
      process.exit();
    });
  } catch (e) {
    console.error(e);
    import_process.exit(1);
  }
  await startPing(storage, SRV_RECORD);
}
main();
