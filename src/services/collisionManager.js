export function getContactPointWithCircle(pX1, pY1, pX2, pY2, pR, bX1, bY1, bX2, bY2, bR) {
  // Input data :
  // Player start center point = pX1,pY1
  // Player end center point = pX2,pY2
  // Player radius = pR
  // Ball start center point = bX1,bY1
  // Ball end center point = bX2,bY2
  // Ball radius = bR
  // Ball angle = bA

  // Unknowns :
  // Ball contact center point = bX,bY
  // Player contact center point = pX,pY

  // Variables :
  const R = bR + pR;
  const A = (bY2 - bY1) / (bX2 - bX1);
  const B = bY1 - (bY2 - bY1) / (bX2 - bX1) * bX1;

  // Equations :
  // EQ1 : R^2 = (bX - pX)^2 + (bY - pY)^2
  // EQ2 : bY = A * bX + B
  // EQ3 : pX = pX1 = pX2
  // EQ4 : (pY2 - pY1) * n = pY2 - pY
  // EQ5 : (bX2 - bX1) * n = bX2 - bX
  // EQ5 : (bY2 - bY1) * n = bY2 - bY

  // bX :
  // R^2 = (bX - pX1)^2 + (A * bX + B + (pY2 - pY1) * (bX2 - bX) / (bX2 - bX1) - pY2)^2
  // R^2 = (bX - pX1)^2 + (C * bX + D)^2

  // Variables :
  const C = A - (pY2 - pY1) / (bX2 - bX1);
  const D = B + (pY2 - pY1) / (bX2 - bX1) * bX2 - pY2;

  // bX :
  // R^2 = bX^2 - 2 * pX1 * bX + pX1^2 + C^2 * bX^2 + 2 * C * D * bX + D^2
  // (1 + C^2) * bX^2 + 2 * (C * D - pX1) * bX + pX1^2 + D^2 - R^2 = 0
  let { delta, sol1: bXSol1, sol2: bXSol2 } = solvePolynomial(
    1 + Math.pow(C, 2),
    2 * (C * D - pX1),
    Math.pow(pX1, 2) + Math.pow(D, 2) - Math.pow(R, 2)
  );

  if (delta <= 0) {
    // No solutions.
    return { n: Infinity };
  }

  let bYSol1 = A * bXSol1 + B;
  let bYSol2 = A * bXSol2 + B;
  const nSol1 = (bX2 - bXSol1) / (bX2 - bX1);
  const nSol2 = (bX2 - bXSol2) / (bX2 - bX1);

  const isSol1Valid = nSol1 >= 0 && nSol1 < 1;
  const isSol2Valid = nSol2 >= 0 && nSol2 < 1;

  let n;
  if (!isSol1Valid && !isSol2Valid) {
    // Invalid solution.
    return { n: Infinity };
  } else if (isSol1Valid && isSol2Valid && nSol1 > nSol2) {
    n = nSol1;
  } else if (isSol1Valid && isSol2Valid) {
    n = nSol2;
  } else if (isSol1Valid) {
    n = nSol1;
  } else {
    n = nSol2;
  }

  if (n === nSol2) {
    [ bXSol1, bXSol2 ] = [ bXSol2, bXSol1 ];
    [ bYSol1, bYSol2 ] = [ bYSol2, bYSol1 ];
  }

  // Solution variables.
  const bX = bXSol1;
  const bY = bYSol1;
  const pX = pX1;
  const pY = pY2 - (pY2 - pY1) * n;

  // Check that the ball direction is from player external to player internal.
  const dC2B1 = Math.sqrt(Math.pow((bXSol2 - bX1), 2) + Math.pow((bYSol2 - bY1), 2));
  const dC2B2 = Math.sqrt(Math.pow((bXSol2 - bX2), 2) + Math.pow((bYSol2 - bY2), 2));
  const dC1B2 = Math.sqrt(Math.pow((bXSol1 - bX2), 2) + Math.pow((bYSol1 - bY2), 2));

  if (dC2B1 > dC2B2 || dC1B2 > dC2B2) {
    return { bX, bY, n: 1 - n, pX, pY };
  }

  return { n: Infinity };
}

export function getContactPointWithHLine(y, bX1, bY1, bX2, bY2, bR, bottomToTop) {
  // Input data :
  // Horizontal line equation = y
  // Ball start center point = bX1,bY1
  // Ball end center point = bX2,bY2
  // Ball radius = bR
  // Ball direction = bottomToTop

  // Unknowns :
  // Ball contact center point = bX,bY

  // Variables :
  const A = (bY2 - bY1) / (bX2 - bX1);
  const B = bY1 - (bY2 - bY1) / (bX2 - bX1) * bX1;

  // Equations :
  // EQ1 : bY = y - bR * bottomToTop
  // EQ2 : bY = A * bX + B
  // EQ3 : (bX2 - bX1) * n = bX2 - bX
  // EQ4 : (bY2 - bY1) * n = bY2 - bY

  const bY = y - bR * bottomToTop;
  const bX = (bY - B) / A;
  const n = (bX2 - bX) / (bX2 - bX1);

  return { bX, bY, n: 1 - n };
}

export function getContactPointWithPoint(pX1, pY1, pX2, pY2, bX1, bY1, bX2, bY2, bR) {
  // Input data :
  // Point start point = pX1,pY1
  // Point end point = pX2,pY2
  // Ball start center point = bX1,bY1
  // Ball end center point = bX2,bY2
  // Ball radius = bR
  // Ball angle = bA

  // Unknowns :
  // Ball contact center point = bX,bY
  // Point contact point = pX,pY

  // Variables :
  const R = bR;
  const A = (bY2 - bY1) / (bX2 - bX1);
  const B = bY1 - (bY2 - bY1) / (bX2 - bX1) * bX1;

  // Equations :
  // EQ1 : R^2 = (bX - pX)^2 + (bY - pY)^2
  // EQ2 : bY = A * bX + B
  // EQ3 : pX = pX1 = pX2
  // EQ4 : (pY2 - pY1) * n = pY2 - pY
  // EQ5 : (bX2 - bX1) * n = bX2 - bX
  // EQ5 : (bY2 - bY1) * n = bY2 - bY

  // bX :
  // R^2 = (bX - pX1)^2 + (A * bX + B + (pY2 - pY1) * (bX2 - bX) / (bX2 - bX1) - pY2)^2
  // R^2 = (bX - pX1)^2 + (C * bX + D)^2

  // Variables :
  const C = A - (pY2 - pY1) / (bX2 - bX1);
  const D = B + (pY2 - pY1) / (bX2 - bX1) * bX2 - pY2;

  // bX :
  // R^2 = bX^2 - 2 * pX1 * bX + pX1^2 + C^2 * bX^2 + 2 * C * D * bX + D^2
  // (1 + C^2) * bX^2 + 2 * (C * D - pX1) * bX + pX1^2 + D^2 - R^2 = 0
  let { delta, sol1: bXSol1, sol2: bXSol2 } = solvePolynomial(
    1 + Math.pow(C, 2),
    2 * (C * D - pX1),
    Math.pow(pX1, 2) + Math.pow(D, 2) - Math.pow(R, 2)
  );

  if (delta <= 0) {
    // No solutions.
    return { n: Infinity };
  }

  let bYSol1 = A * bXSol1 + B;
  let bYSol2 = A * bXSol2 + B;
  const nSol1 = (bX2 - bXSol1) / (bX2 - bX1);
  const nSol2 = (bX2 - bXSol2) / (bX2 - bX1);

  const isSol1Valid = nSol1 >= 0 && nSol1 < 1;
  const isSol2Valid = nSol2 >= 0 && nSol2 < 1;

  let n;
  if (!isSol1Valid && !isSol2Valid) {
    // Invalid solution.
    return { n: Infinity };
  } else if (isSol1Valid && isSol2Valid && nSol1 > nSol2) {
    n = nSol1;
  } else if (isSol1Valid && isSol2Valid) {
    n = nSol2;
  } else if (isSol1Valid) {
    n = nSol1;
  } else {
    n = nSol2;
  }

  if (n === nSol2) {
    [ bXSol1, bXSol2 ] = [ bXSol2, bXSol1 ];
    [ bYSol1, bYSol2 ] = [ bYSol2, bYSol1 ];
  }

  // Solution variables.
  const bX = bXSol1;
  const bY = bYSol1;
  const pX = pX1;
  const pY = pY2 - (pY2 - pY1) * n;

  // Check that the ball direction is from player external to player internal.
  const dC2B1 = Math.sqrt(Math.pow((bXSol2 - bX1), 2) + Math.pow((bYSol2 - bY1), 2));
  const dC2B2 = Math.sqrt(Math.pow((bXSol2 - bX2), 2) + Math.pow((bYSol2 - bY2), 2));
  const dC1B2 = Math.sqrt(Math.pow((bXSol1 - bX2), 2) + Math.pow((bYSol1 - bY2), 2));

  if (dC2B1 > dC2B2 || dC1B2 > dC2B2) {
    return { bX, bY, n: 1 - n, pX, pY };
  }

  return { n: Infinity };
}

export function solvePolynomial(a, b, c) {
  const delta = Math.pow(b, 2) - 4 * a * c;

  if (delta <= 0) {
    return { delta };
  }

  const sol1 = (- b - Math.sqrt(delta)) / 2 / a;
  const sol2 = (- b + Math.sqrt(delta)) / 2 / a;

  return { delta, sol1, sol2 };
}
