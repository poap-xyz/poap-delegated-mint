pragma solidity ^0.5.15;

// Minimal POAP contract implementation
// Needed for the main contract

contract Poap {

    /**
     * @dev Function to mint tokens
     * @param eventId EventId for the new token
     * @param to The address that will receive the minted tokens.
     * @return A boolean that indicates if the operation was successful.
     */
    function mintToken(uint256 eventId, address to) public returns (bool);
}
