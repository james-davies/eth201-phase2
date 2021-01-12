import "./Ownable.sol";
import "./ProvableAPI.sol";

pragma solidity 0.6.2;

contract Coinflip is Ownable, usingProvable {

  uint256 constant NUM_RANDOM_BYTES_REQUESTED = 1;
  uint256 public latestNumber;

  event coinFlipped(address sender, uint result);
  event LogNewProvableQuery(string description);
  event generatedRandomNumber(uint256 randomNumber);

  mapping(address => bool) public isPlaying;
  mapping(address => uint) public balance;

  modifier costs(uint cost){
      require(msg.value >= cost, "Value insufficient");
      _;
  }

  constructor() public{
      update();
  }

  function maxCost(address _address)
  public
  view
  returns(uint)
  {
    return balance[_address] / 2 ;
  }

  function __callback(bytes32 _queryID, string memory _result, bytes memory _proof)
  public
  override
  {
      require(msg.sender == provable_cbAddress());
      uint256 randomNumber = uint256(keccak256(abi.encodePacked(_result)));
      latestNumber = randomNumber % 2;
      emit generatedRandomNumber(randomNumber);
  }

  function update()
  payable
  public
  {
      uint256 QUERY_EXECUTION_DELAY = 0;
      uint256 GAS_FOR_CALLBACK = 200000;
      provable_newRandomDSQuery(QUERY_EXECUTION_DELAY, NUM_RANDOM_BYTES_REQUESTED, GAS_FOR_CALLBACK);
      emit LogNewProvableQuery("Provable query was sent, standing by for answer...");
  }

  function gamble()
  public
  payable
  costs(maxCost(msg.sender))
  returns(uint)
  {
    require(msg.value <= address(this).balance, "Contract doesnt have enough funds to pay out potential win");
    address player = msg.sender;
    if(!isPlaying[player])
    {
      isPlaying[player] = true;
      update();
      uint result = latestNumber;
      emit coinFlipped(player, result);
      if(result == 0){
          balance[player] -= msg.value;
      } else {
         balance[player] += msg.value;
      }
      isPlaying[player] = false;
      return result;
    }
    else {
      return 2;
    }
  }

  function withdraw()
  public
  payable
  {
    uint toTransfer = getUserBalance(msg.sender);
    balance[msg.sender] = 0;
    msg.sender.transfer(toTransfer);
  }

  function deposit()
  public
  payable
  {
    balance[msg.sender] += msg.value;
  }

  function getUserBalance(address _address)
  public
  view
  returns(uint)
  {
    return balance[_address];
  }

  function close() public onlyOwner {
      msg.sender.transfer(address(this).balance);
      selfdestruct(msg.sender);
  }

}
