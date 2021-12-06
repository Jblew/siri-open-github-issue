export function envMust<T>(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Env ${name} must be set`);
  return v;
}

export function sleepMs(timeMs: number) {
  return new Promise((resolve) => setTimeout(resolve, timeMs));
}
