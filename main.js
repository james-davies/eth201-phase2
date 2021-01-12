var web3 = new Web3(Web3.givenProvider);
var contractInstance;
var contractAddress = "0x0dD340dd64941c3cc861A33C239D1453E397b943";
var userAddress;
var betResult = $("#result");

$(document).ready(function(){
  window.ethereum.enable().then(function(accounts){
    userAddress = accounts[0];
    contractInstance = new web3.eth.Contract(abi, contractAddress, {from: accounts[0]});
    refreshBalances();
  })

  $("#btn_deposit").click(deposit);
  $("#btn_withdraw").click(withdraw);
  $('#btn_bet').click(flipCoin);
})

function flipCoin() {
  document.getElementById("result").innerHTML = "";
  let config = {
    value: web3.utils.toWei($('#bet_amount').val(), 'ether')
  };
  let betValue = $('#bet_selection').val()
  contractInstance.methods.gamble().send(config).then(function (res) {
    let result_uint = res.events.coinFlipped.returnValues[1];
    console.log("Result: " + result_uint);
    if (result_uint == 0 || result_uint == 1) {
      if (result_uint == betValue) {
        $("<h1/>").text("WIN!").appendTo("#result");
      } else if (result_uint == 0) {
        $("<h1/>").text("LOSE").appendTo("#result");
      }
      refreshBalances();
    } else if (result_uint == 2){
      alert("Only one flip at a time")
    }
  })
}

function refreshBalances() {
  getMaxBet(userAddress);
  getUserBalance();
  getContractBalance();
  getAvailableUserBalance();
}

function getContractBalance() {

  web3.eth.getBalance(contractAddress)
  .then((res) => {
    $("#contract_balance_output").text(web3.utils.fromWei(res, "ether"))
  });
}

function getMaxBet(userAddress) {
    contractInstance.methods.maxCost(userAddress).call().then((res) => {
    $('#maxcost_output').text(web3.utils.fromWei(res, "ether"));
    })
}

// This is the user amount locked in the contract
function getAvailableUserBalance() {
    contractInstance.methods.getUserBalance(userAddress).call().then((res) => {

      var userContractFunds = web3.utils.fromWei(res, "ether");
      if (userContractFunds == 0) {
        $("#available_user_balance_output").text(0);
      } else{
        $("#available_user_balance_output").text(userContractFunds);
      }
    })
}

// This is the user amount of ETH in users own wallet
function getUserBalance() {
	web3.eth.getBalance(userAddress).then((res) => {
		$('#user_balance_output').text(web3.utils.fromWei(res, "ether"))
	});
}


function refreshPage(){
    window.location.reload();
}

function deposit(){
  var amount = $("#deposit_amount").val() ;
  var config = {
    value:web3.utils.toWei(amount, "ether")
  }
 contractInstance.methods.deposit().send(config)
 .on("transactionHash", function( hash) {
  console.log (hash);
 })
.on("confirmation", function (confirmationNr){
  console.log(confirmationNr);
})
.on("receipt" ,function(receipt){
  console.log(receipt);
  refreshBalances();
})
}

function withdraw() {
  contractInstance.methods.withdraw().send().then(()=>{
    refreshBalances();
  });
}
