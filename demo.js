const { runSimulations } = require("./simulations");
const results = runSimulations();
console.table(results.map(r => ({ scenario: r.id, expected: r.expected, actual: r.actual, PASS: r.pass })));
if (!results.every(r => r.pass)) process.exitCode = 1;
