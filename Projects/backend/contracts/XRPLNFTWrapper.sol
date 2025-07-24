// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title XRPLNFTWrapper
 * @dev Smart contract for wrapping XRPL NFTs on Songbird network
 * @notice This contract allows XRPL NFTs to be represented as ERC721 tokens on Songbird
 */
contract XRPLNFTWrapper is ERC721, ERC721URIStorage, ERC721Pausable, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;

    // Token ID counter
    Counters.Counter private _tokenIdCounter;

    // Mapping from Songbird token ID to XRPL NFT ID
    mapping(uint256 => string) private _xrplNftIds;
    
    // Mapping from XRPL NFT ID to Songbird token ID
    mapping(string => uint256) private _songbirdTokenIds;
    
    // Mapping to track wrapped status
    mapping(uint256 => bool) private _isWrapped;
    
    // Mapping to track wrap timestamp
    mapping(uint256 => uint256) private _wrapTimestamp;
    
    // Base URI for metadata
    string private _baseTokenURI;
    
    // Contract metadata
    string private _contractURI;

    // Events
    event NFTWrapped(
        uint256 indexed tokenId, 
        string indexed xrplNftId, 
        address indexed recipient, 
        string metadataURI
    );
    
    event NFTUnwrapped(
        uint256 indexed tokenId, 
        string indexed xrplNftId, 
        address indexed owner
    );
    
    event BaseURIUpdated(string newBaseURI);
    event ContractURIUpdated(string newContractURI);

    /**
     * @dev Constructor
     * @param name Token name
     * @param symbol Token symbol
     * @param baseURI Base URI for token metadata
     */
    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI,
        string memory contractURI_
    ) ERC721(name, symbol) {
        _baseTokenURI = baseURI;
        _contractURI = contractURI_;
    }

    /**
     * @dev Wrap an XRPL NFT as an ERC721 token
     * @param xrplNftId The XRPL NFT ID to wrap
     * @param metadataURI URI pointing to the NFT metadata
     * @param recipient Address to receive the wrapped NFT
     * @return tokenId The newly minted token ID
     */
    function wrapXRPLNFT(
        string calldata xrplNftId,
        string calldata metadataURI,
        address recipient
    ) external onlyOwner nonReentrant whenNotPaused returns (uint256) {
        require(bytes(xrplNftId).length > 0, "Invalid XRPL NFT ID");
        require(recipient != address(0), "Invalid recipient address");
        require(_songbirdTokenIds[xrplNftId] == 0, "NFT already wrapped");

        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();

        // Store mappings
        _xrplNftIds[tokenId] = xrplNftId;
        _songbirdTokenIds[xrplNftId] = tokenId;
        _isWrapped[tokenId] = true;
        _wrapTimestamp[tokenId] = block.timestamp;

        // Mint the token
        _safeMint(recipient, tokenId);
        
        // Set token URI if provided
        if (bytes(metadataURI).length > 0) {
            _setTokenURI(tokenId, metadataURI);
        }

        emit NFTWrapped(tokenId, xrplNftId, recipient, metadataURI);
        return tokenId;
    }

    /**
     * @dev Unwrap an ERC721 token back to XRPL NFT
     * @param tokenId The token ID to unwrap
     * @return xrplNftId The original XRPL NFT ID
     */
    function unwrapNFT(uint256 tokenId) external nonReentrant whenNotPaused returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        require(_isWrapped[tokenId], "Token is not wrapped");
        require(
            ownerOf(tokenId) == _msgSender() || getApproved(tokenId) == _msgSender(),
            "Not owner or approved"
        );

        string memory xrplNftId = _xrplNftIds[tokenId];
        address owner = ownerOf(tokenId);

        // Update state
        _isWrapped[tokenId] = false;
        delete _songbirdTokenIds[xrplNftId];

        // Burn the wrapped token
        _burn(tokenId);

        emit NFTUnwrapped(tokenId, xrplNftId, owner);
        return xrplNftId;
    }

    /**
     * @dev Get XRPL NFT ID for a given token ID
     * @param tokenId The token ID
     * @return The XRPL NFT ID
     */
    function getXRPLNftId(uint256 tokenId) external view returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return _xrplNftIds[tokenId];
    }

    /**
     * @dev Get Songbird token ID for a given XRPL NFT ID
     * @param xrplNftId The XRPL NFT ID
     * @return The Songbird token ID (0 if not wrapped)
     */
    function getSongbirdTokenId(string calldata xrplNftId) external view returns (uint256) {
        return _songbirdTokenIds[xrplNftId];
    }

    /**
     * @dev Check if a token is currently wrapped
     * @param tokenId The token ID to check
     * @return True if wrapped, false otherwise
     */
    function isWrapped(uint256 tokenId) external view returns (bool) {
        return _exists(tokenId) && _isWrapped[tokenId];
    }

    /**
     * @dev Get comprehensive wrapper information
     * @param tokenId The token ID
     * @return xrplNftId The XRPL NFT ID
     * @return wrapped Whether the token is wrapped
     * @return wrapTimestamp When the token was wrapped
     */
    function getWrapperInfo(uint256 tokenId) 
        external 
        view 
        returns (string memory xrplNftId, bool wrapped, uint256 wrapTimestamp) 
    {
        require(_exists(tokenId), "Token does not exist");
        return (_xrplNftIds[tokenId], _isWrapped[tokenId], _wrapTimestamp[tokenId]);
    }

    /**
     * @dev Check if an XRPL NFT is already wrapped
     * @param xrplNftId The XRPL NFT ID to check
     * @return True if already wrapped, false otherwise
     */
    function isXRPLNFTWrapped(string calldata xrplNftId) external view returns (bool) {
        uint256 tokenId = _songbirdTokenIds[xrplNftId];
        return tokenId != 0 && _isWrapped[tokenId];
    }

    /**
     * @dev Get total number of wrapped NFTs
     * @return Total wrapped count
     */
    function totalWrapped() external view returns (uint256) {
        return _tokenIdCounter.current();
    }

    /**
     * @dev Set base URI for token metadata
     * @param baseURI New base URI
     */
    function setBaseURI(string calldata baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
        emit BaseURIUpdated(baseURI);
    }

    /**
     * @dev Set contract URI for marketplace metadata
     * @param contractURI_ New contract URI
     */
    function setContractURI(string calldata contractURI_) external onlyOwner {
        _contractURI = contractURI_;
        emit ContractURIUpdated(contractURI_);
    }

    /**
     * @dev Pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Emergency function to update token URI (only owner)
     * @param tokenId Token ID
     * @param uri New URI
     */
    function setTokenURI(uint256 tokenId, string calldata uri) external onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        _setTokenURI(tokenId, uri);
    }

    /**
     * @dev Get contract URI for marketplace integration
     * @return Contract metadata URI
     */
    function contractURI() external view returns (string memory) {
        return _contractURI;
    }

    /**
     * @dev Override _baseURI to return custom base URI
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @dev Override _beforeTokenTransfer to handle pausable functionality
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Pausable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    /**
     * @dev Override _burn to handle URI storage cleanup
     */
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
        
        // Clean up mappings
        string memory xrplNftId = _xrplNftIds[tokenId];
        delete _xrplNftIds[tokenId];
        delete _isWrapped[tokenId];
        delete _wrapTimestamp[tokenId];
    }

    /**
     * @dev Override tokenURI to handle URI storage
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    /**
     * @dev Override supportsInterface for multiple inheritance
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
