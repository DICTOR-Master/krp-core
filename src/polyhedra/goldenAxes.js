const PHI = (1 + Math.sqrt(5)) / 2;
const axis = (x, y, z) => {
  const k = 1 / (PHI * Math.hypot(x, y, z));
  return [x * k, y * k, z * k];
};
export const GOLDEN_AXES = [axis(0, 1, PHI), axis(0, -1, PHI), axis(1, PHI, 0), axis(-1, PHI, 0), axis(PHI, 0, 1), axis(-PHI, 0, 1)];
