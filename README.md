# itgenio-srv-resolver

Receive info about SRV records.

The package uses TypeScript and esbuild. NodeJS 12+

## How to build

```bash
npm i && npm run build
```

## How to start

You need to specify required env. parameter `SRV_RECORD` like:

```bash
SRV_RECORD=_mongodb._tcp.db.example.com node dist/main.js
```

## docker-compose.yml

```yml
version: "3"
services:
  srv-resolver:
    restart: always
    image: asosnovskiy/itgenio-srv-resolver
    user: root
    ports:
      - 5000:5000
    environment:
      SRV_RECORD: "_mongodb._tcp.db.example.com"
```

## Config
You can provide configuration via env. variables:
```typescript
SRV_RECORD: string; // required
TIMEOUT: number = 2500; //ms, socket's timeout
PING_INTERVAL: number = 3000; //ms, ping srv services every X ms
RESOLVER_SERVER: string = '8.8.8.8'; // resolver server ip
HTTP_PORT: number = 5000; // http api port
```
