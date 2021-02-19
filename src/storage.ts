type Server = {
  name: string;
  port: number;
  ping: number;
} | {
  name: string;
  port: number;
  error: string;
};

export class Storage {
  servers: Server[] = [];
}