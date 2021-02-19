# itgenio-srv-resolver

Receive info about SRV records.

The package uses TypeScript and esbuild.

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