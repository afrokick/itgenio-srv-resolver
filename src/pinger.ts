import { promises } from 'dns';
import net from 'net';
import { RESOLVER_SERVER, PING_INTERVAL, TIMEOUT } from './config';
import { Storage } from './storage';
import { t, wait, error, log } from './utils';

const resolver = new promises.Resolver();
resolver.setServers([RESOLVER_SERVER]);

async function ping(ip: string, port: number): Promise<void> {
  return new Promise((res, rej) => {
    const sock = new net.Socket();
    sock.setTimeout(TIMEOUT);
    sock.on('connect', function () {
      res();
      sock.destroy();
    }).on('error', function (e: Error) {
      rej(e);
    }).on('timeout', function (e: Error) {
      rej(e);
    }).connect(+port, ip);
  });
}

async function fillWithPing(address: { name: string, port: number; }) {
  try {
    const st = t();

    await ping(address.name, address.port);

    return { ...address, ping: t() - st };
  } catch (e) {
    return { ...address, error: e.toString() };
  }
};

export async function startPing(storage: Storage, srvRecord: string): Promise<void> {
  log(`Pinger: started`);

  while (true) {
    try {
      const addresses = await resolver.resolveSrv(srvRecord);

      const filledAddresses = await Promise.all(addresses.map(address => fillWithPing(address)));

      storage.servers = filledAddresses;

      filledAddresses.forEach(address => {
        if ('error' in address) {
          error(`Pinger: Address ${address.name}:${address.port} has error: ${address.error}`);
        }
      });
    } catch (e) {
      error(`Pinger: ${e.toString()}`);
    }

    await wait(PING_INTERVAL);
  }
}