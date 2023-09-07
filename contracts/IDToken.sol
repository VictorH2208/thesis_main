pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract IDToken is ERC721, ERC721URIStorage, ERC721Burnable, Ownable {

    //for autoincrementing token serial #
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    //map address to token serial
    mapping(address => uint256) private _tokens;

    //map credential ids to addresses and pubkeys
    mapping(uint256 => address) private _signers;
    mapping(uint256 => bytes) private _pubkeys;

    constructor() ERC721("IDToken", "ID") {
        //_tokenIdCounter.increment(); //start at tokenId 1 so ID 0 can be null token
    }

    //modifiers
    modifier onlyHolder(uint256 tokenId) {
        require(msg.sender == ownerOf(tokenId), "Must be called by token holder");
        _;
    }
    modifier onlySigner(uint256 credentialId){
        require(msg.sender == signerOf(credentialId),"Must be called by credential issuer/signer");
        _;
    }

    //events
    //event URIUpdate(uint256 indexed tokenId, string newURI);
    //event CredentialIssued(uint256 indexed credentialId);

    //public methods
    function issue(address to, string memory uri) public onlyOwner{
        uint256 tokenId = _tokenIdCounter.current(); //may be changed to something else later instead of autoincrement
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }
    function revoke(uint256 tokenId) public onlyOwner { //revoke by tokenid
        _burn(tokenId);
    }
    function revokeByAddress(address owner) public onlyOwner { //revoke by address, not sure which is more useful
        uint256 tokenId = tokenOf(owner);
        _burn(tokenId);
    }
    function updateURI(uint256 tokenId, string memory uri) public onlyHolder(tokenId) {
        _setTokenURI(tokenId,uri);
    }
    function addCredential(uint256 credentialId, bytes memory pubkey, address signer) public onlyOwner {
        //address signer = msg.sender;
        _setSigner(credentialId,signer);
        _setPubKey(credentialId,pubkey);
        //emit CredentialIssued(credentialId);
    }
    function revokeCredential(uint256 credentialId) public onlySigner(credentialId){
        _revokeCredential(credentialId);
    }

    //bookkeeping
    function ownerOf(uint256 tokenId) public view override returns (address) {
        address owner = _ownerOf(tokenId);
        //require(owner != address(0), "ERC721: invalid token ID"); //not sure if needed
        return owner;
    }
    function tokenOf(address owner) public view returns (uint256) {
        require(owner != address(0), "ERC721: address zero is not a valid owner");
        //require(_exists(_tokenOf(owner)),"Address has no valid tokens"); //not sure if needed
        return _tokenOf(owner);
    }
    function signerOf(uint256 credentialId) public view returns (address) {
        address signer = _signerOf(credentialId);
        return signer;
    }
    function pubKeyOf(uint256 credentialId) public view returns (bytes memory) {
        return _pubKeyOf(credentialId);
    }
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    function exists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId); //_exists checks if owner is not 0 address
    }

    //override public methods
    //maybe need to work on this eventually for account recovery
    function transferFrom(address from,address to,uint256 tokenId) public override {
        require(1==0,"Cannot transfer ID Token");
    }
    function safeTransferFrom(address from,address to,uint256 tokenId) public override {
        require(1==0,"Cannot transfer ID Token");
    }
    function safeTransferFrom(address from,address to,uint256 tokenId,bytes memory data) public override {
        require(1==0,"Cannot transfer ID Token");
    }

    //internal functions
    function _setSigner(uint256 credentialId, address signer) internal {
        require(signer != address(0),"Invalid address");
        _signers[credentialId] = signer;
    }
    function _setPubKey(uint256 credentialId, bytes memory pubkey) internal {
        _pubkeys[credentialId] = pubkey;
    }
    function _tokenOf(address owner) internal view returns (uint256) {
        return _tokens[owner];
    }
    function _signerOf(uint256 credentialId) internal view returns (address){
        address signer = _signers[credentialId];
        require(signer != address(0),"Invalid signer");
        return signer;
    }
    function _pubKeyOf(uint256 credentialId) internal view returns (bytes memory){
        return _pubkeys[credentialId];
    }
    function _revokeCredential(uint256 credentialId) internal {
        _signers[credentialId] = address(0);
    }
    //override mint function
    function _mint(address to, uint256 tokenId) internal override(ERC721) {
        require(_ownerOf(_tokenOf(to)) != to,"Address already has token");
        //require(!_exists(_tokenOf(to)),"Address already has token");
        ERC721._mint(to, tokenId);
        _tokens[to] = tokenId;
    }
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal override(ERC721URIStorage) {
        ERC721URIStorage._setTokenURI(tokenId,_tokenURI);
        //emit URIUpdate(tokenId,_tokenURI);
    }

}