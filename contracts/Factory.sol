class IntelligenceInvestorNFT {
    ' -- inheritance --
	{abstract}ERC721Enumerable
	{abstract}ReentrancyGuard

    ' -- usingFor --
	{abstract}📚Strings for [[uint256]]

    ' -- vars --
	#[[string]] _baseTokenURI
	+[[bool]] _paused
	+[[uint256]] MAX_TOTAL_SUPPLY
	+[[uint256]] MAX_MINT_PER_ADDR
	+[[uint256]] MAX_MINT_PER_TX
	+[[uint256]] SIL_NFT_TOKEN_ID
	+[[address]] SIL_NFT_CONTRACT_ADDR
	+[[uint256]] MINT_PRICE
	+[[address]] TOKEN_ADDR
	+[[uint256]] LAUNCH_START_TIME
	+[[uint256]] LAUNCH_END_TIME
	+[[address]] factory
	+[[mapping address=>uint256 ]] mintedPerAddress

    ' -- methods --
	+**__constructor__**()
	+initializes()
	+🔍owner()
	+adopt()
	+🔍walletOfOwner()
	#🔍_baseURI()
	+setBaseURI()
	+stop()
	+💰withdraw()
	+🔍version()

}
' -- inheritance / usingFor --
IntelligenceInvestorNFT --[#DarkGoldenRod]|> ERC721Enumerable
IntelligenceInvestorNFT --[#DarkGoldenRod]|> ReentrancyGuard
IntelligenceInvestorNFT ..[#DarkOliveGreen]|> Strings : //for uint256//

@enduml
contract NextIntelligenceExchangeFactory is
    INextIntelligenceExchangeFactory,
    Ownable
{
    bytes32 public constant INIT_CODE_PAIR_HASH =
        keccak256(abi.encodePacked(type(IntelligenceInvestorNFT).creationCode));

    mapping(uint256 => address) public override getInvestorNFT;
    address[] public allInvestorNFTs;

    address public smartIntelligenceExchangeNFTAddr;

    constructor(address _smartIntelligenceExchangeNFTAddr) {
        smartIntelligenceExchangeNFTAddr = _smartIntelligenceExchangeNFTAddr;
    }

    function allInvestorNFTsLength() external view override returns (uint256) {
        return allInvestorNFTs.length;
    }

    function createInvestorNFT(uint256 _tokenId, string memory _name, string memory _symbol)
        external
        override
        returns (address investorNFT)
    {
        require(
            IERC721Metadata(smartIntelligenceExchangeNFTAddr).ownerOf(
                _tokenId
            ) == msg.sender,
            "The caller must be holder of NFT token Id"
        );
        require(
            smartIntelligenceExchangeNFTAddr != address(0),
            "Needs to set Smart Intelligence Exchange NFT Contract address"
        );
        require(
            getInvestorNFT[_tokenId] == address(0),
            "NEXT INTELLIGENCE EXCHANGE: INTELLIGENCE_INVESTOR_NFT_EXISTS"
        );
        bytes memory bytecode = abi.encodePacked(
            type(IntelligenceInvestorNFT).creationCode,
            abi.encode(smartIntelligenceExchangeNFTAddr, _tokenId, _name, _symbol)
        );
        bytes32 salt = keccak256(
            abi.encodePacked(smartIntelligenceExchangeNFTAddr, _tokenId)
        );
        assembly {
            investorNFT := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }

        emit InvestorNFTCreated(_tokenId, investorNFT);

        getInvestorNFT[_tokenId] = investorNFT;
        allInvestorNFTs.push(investorNFT);
    }

    function setSmartIntelligenceExchangeNFTAddr(
        address _smartIntelligenceExchangeNFTAddr
    ) external onlyOwner {
        smartIntelligenceExchangeNFTAddr = _smartIntelligenceExchangeNFTAddr;
    }
}


