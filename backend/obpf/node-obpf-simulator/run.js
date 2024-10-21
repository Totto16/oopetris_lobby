const path = require('path');
console.log('JS: START 1');

const rootDir = path.join(__dirname, '.');
const nodeNativePackage = require('node-gyp-build')(rootDir);
console.log('JS: START 2');

console.log(nodeNativePackage);

nodeNativePackage.register_logger((...args) => {
    console.log('JS:', ...args);
    console.log(msg);
});

console.log('JS: START');

const result = nodeNativePackage.start(43523, 1);
console.log('JS: RETURN');
