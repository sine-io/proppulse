export function median(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }

  const sorted = [...values].sort((left, right) => left - right);
  const middleIndex = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 1) {
    return sorted[middleIndex] ?? null;
  }

  const left = sorted[middleIndex - 1];
  const right = sorted[middleIndex];

  if (left === undefined || right === undefined) {
    return null;
  }

  return (left + right) / 2;
}

export function percentageChange(
  previous: number | null | undefined,
  next: number | null | undefined,
): number | null {
  if (
    previous === null ||
    previous === undefined ||
    next === null ||
    next === undefined ||
    previous === 0
  ) {
    return null;
  }

  return ((next - previous) / previous) * 100;
}

export function inventoryDelta(previous: number, next: number): {
  difference: number;
  percent: number | null;
  isSignificant: boolean;
  isRise: boolean;
  isFall: boolean;
} {
  const difference = next - previous;
  const percent = previous === 0 ? null : (difference / previous) * 100;
  const isSignificant =
    Math.abs(difference) >= 2 || (percent !== null && Math.abs(percent) >= 10);

  return {
    difference,
    percent,
    isSignificant,
    isRise: isSignificant && difference > 0,
    isFall: isSignificant && difference < 0,
  };
}
