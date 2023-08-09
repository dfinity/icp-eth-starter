function abbreviate(value: string, left: number, right: number) {
  return `${value.slice(0, left)}...${value.slice(-right)}`;
}

export function abbreviateAddress(address: string) {
  return abbreviate(address, 5, 3);
}

export function abbreviatePrincipal(principal: string) {
  return abbreviate(principal, 5, 3);
}
