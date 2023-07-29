const trillion = 1e12;
const round = 1e3;

type Cycles = number | bigint | string;

export function displayCycles(amount: Cycles): string;
export function displayCycles(amount: Cycles | undefined): string | undefined;
export function displayCycles(amount: Cycles | undefined): string | undefined {
  if (amount === undefined) {
    return amount;
  }
  const c = Number(amount);
  if (c === 0) {
    return '0 TC';
  }
  const tc = Math.floor((c * round) / trillion) / round;
  if (tc === 0) {
    return `< ${1 / round} TC`;
  }
  return `${tc} TC`;
}

export function localizeCycles(amount: Cycles): string;
export function localizeCycles(amount: Cycles | undefined): string | undefined;
export function localizeCycles(amount: Cycles | undefined): string | undefined {
  if (amount === undefined) {
    return amount;
  }
  return Number(amount).toLocaleString();
}
