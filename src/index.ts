import { AnyARecord } from 'dns';
import { exit } from 'process';
import { RESOLVER_SERVER, PING_INTERVAL, TIMEOUT, SRV_RECORD, HTTP_PORT } from './config';
import { startHttpServer } from './httpServer';
import { startPing } from './pinger';
import { Storage } from './storage';
import { log } from './utils';

const storage = new Storage();

async function main() {
  if (!SRV_RECORD) {
    console.error(`You need to pass SRV_RECORD env`);
    exit(1);
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

    process.on("SIGINT", function () {
      server.close();
      //graceful shutdown
      process.exit();
    });
  } catch (e) {
    console.error(e);
    exit(1);
  }

  await startPing(storage, SRV_RECORD);
};

main();