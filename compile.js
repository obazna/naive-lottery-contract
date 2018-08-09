const path = require('path');
const fs = require('fs');
const solc = require('solc');

const naiveLotteryPath = path.resolve(__dirname, 'contracts', 'NaiveLottery.sol');
const source = fs.readFileSync(naiveLotteryPath, 'utf8');

module.exports = solc.compile(source, 1).contracts[':NaiveLottery'];