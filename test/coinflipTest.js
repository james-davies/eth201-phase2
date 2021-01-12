const CoinFlip = artifacts.require("CoinFlip");
const truffleAssert = require("truffle-assertions");

contract("CoinFlip", async (accounts) => {

  let instance;

  before(async ()=> {
    instance = await Coinflip.deployed();
  })

  it("should only be able to gamble with input 0 and 1", async()=>{
    instance.deposit({value: web3.utils.toWei("2", "ether"), from: accounts[0]});
    await truffleAssert.passes(instance.gamble(1, {value: web3.utils.toWei("1", "ether"), from: accounts[0]}));
    await truffleAssert.failed(instance.gamble(2, {value: web3.utils.toWei("1", "ether"), from: accounts[0]}));
  })

  it("should be possible for user to deposit and withdraw", async()=>{
    await truffleAssert.passes(instance.deposit({value: web3.utils.toWei("1", "ether")}));
    await truffleAssert.passes(instance.withdraw());
  })

})
