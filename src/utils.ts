export function t(): number { return new Date().getTime(); }

const formatNow = (): string => {
  const d = new Date();

  const date = d.toLocaleDateString('ru');
  const time = d.toLocaleTimeString('ru');
  const ms = `${d.getTime() % 1000}`.padStart(3, '0');

  return `${date} ${time}.${ms}`;
};

export function log(...args: any[]) { console.log(`[${formatNow()}]`, ...args); }

export function error(...args: any[]) { console.error(`[${formatNow()}]`, ...args); }

export function wait(ms: number): Promise<void> {
  return new Promise((res) => {
    setTimeout(() => res(), ms);
  });
}
