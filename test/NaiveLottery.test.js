const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');

const web3 = new Web3(ganache.provider());

const { interface, bytecode } = require('../compile');

let naiveLottery;
let accounts;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    naiveLottery = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode })
        .send({ from: accounts[0], gas: '1000000' });
});

describe('NaiveLottery Contract', () => {
    it('deploys a contract', () => {
        assert.ok(naiveLottery.options.address);
    });

    it('allows one account to enter', async () => {
        await naiveLottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        });

        const players = await naiveLottery.methods.getPlayers().call({
            from: accounts[0]
        });
        assert.equal(accounts[0], players[0]);
        assert.equal(1, players.length);
    });

    it('allows multiple account to enter', async () => {
        await naiveLottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        });

        await naiveLottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('0.02', 'ether')
        });

        await naiveLottery.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei('0.02', 'ether')
        });

        const players = await naiveLottery.methods.getPlayers().call({
            from: accounts[0]
        });

        assert.equal(3, players.length);
        for (let player = 0; player < players.length; player++) {
            assert.equal(accounts[player], players[player]);
        }
    });

    it('requires a minimum amount of ether', async () => {
        try {
            await naiveLottery.methods.enter().send({
                from: accounts[0],
                value: 0
            });
            assert(false);
        } catch (err) {
            assert(err);
        }
    })

    it('only manager can call pickWinner', async () => {
        try {
            await naiveLottery.methods.pickWinner().send({
                from: accounts[1]
            });
            assert(false);
        } catch (err) {
            assert(err);
        }
    })

    it('send meney to the winner and reset the players array', async () => {
        await naiveLottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('2.', 'ether')
        });

        const initialBalance = await web3.eth.getBalance(accounts[0]);

        await naiveLottery.methods.pickWinner().send({
            from: accounts[0]
        });

        const finalBalance = await web3.eth.getBalance(accounts[0]);
        const difference = finalBalance - initialBalance;
        console.log(finalBalance - initialBalance);
        assert(difference > web3.utils.toWei('1.8', 'ether'));

        // check that players array is empty
        const players = await naiveLottery.methods.getPlayers().call({
            from: accounts[0]
        });
        console.log(players.length);
        assert.equal(0, players.length);

        // check that the contract balance is zero
        const contractBalance = await web3.eth.getBalance(naiveLottery.options.address);
        console.log(contractBalance);
        assert.equal(0, contractBalance);
    });
});