import { dai, dai4, dai4_v2, dai4_v3, dailp, dailp4, dailp4_v2, dailp_v2, dai_v2 } from './dai-bonds';
import { frax, frax4, frax4_v2, fraxlp, fraxlp4, fraxlp4_v2 } from './frax-bonds';
import { usdc, usdc4, usdc4_v2, usdc4_v3, usdclp, usdclp4, usdclp4_v2 } from './usdc-bonds';
import { gohmlp, gohmlp4, gohmlp4_v2 } from './gOHM-bonds';
import { mim, mim4, mim4_v2, mim4_v3 } from './mim-bonds';
import { ftm, ftmv2 } from './ftm-bonds';

// HOW TO ADD A NEW BOND:
// Is it a stableCoin bond? use `new StableBond`
// Is it an LP Bond? use `new LPBond`
// Add new bonds to this array!!
export const allBonds = [
  dai,
  dai_v2,
  dai4,
  dai4_v2,
  dai4_v3,
  dailp,
  dailp4,
  dailp_v2,
  dailp4_v2,
  usdc,
  usdc4,
  usdc4_v2,
  usdc4_v3,
  usdclp,
  usdclp4,
  usdclp4_v2,
  gohmlp,
  gohmlp4,
  gohmlp4_v2,
  mim,
  mim4,
  mim4_v2,
  mim4_v3,
  frax,
  frax4,
  frax4_v2,
  fraxlp,
  fraxlp4,
  fraxlp4_v2,
  ftm,
  ftmv2,
];
export const allBondsMap = allBonds.reduce((prevVal, bond) => {
  return { ...prevVal, [bond.name]: bond };
}, {});

// Debug Log
export default allBonds;
