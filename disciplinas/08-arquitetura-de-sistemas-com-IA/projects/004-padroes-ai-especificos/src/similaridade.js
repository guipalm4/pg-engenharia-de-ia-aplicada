'use strict';

function cosseno(a, b) {
  let p = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    p += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return p / (Math.sqrt(na) * Math.sqrt(nb));
}

module.exports = { cosseno };
