const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const {interface, bytecode} = require('./compile');

const provider = new HDWalletProvider(
    'juice knock wife fire bonus embrace present film amused unveil soldier riot',
    'https://rinkeby.infura.io/9HVy7PWqmQlRYKgpK1Pn'
);

const web3 = new Web3(provider);
const deploy = async () => {
    const accounts = await web3.eth.getAccounts();
    console.log(`Attempting to deploy from account ${accounts[0]}`);
    
    let result = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({
            data: bytecode
        })
        .send({
            gas: '2000000',
            from: accounts[0],
        });  

    console.log(interface);
    console.log(`Contract deployed to ${result.options.address}`);
};

deploy();