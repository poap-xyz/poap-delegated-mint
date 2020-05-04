pragma solidity ^0.5.15;

import "./Poap.sol";

contract PoapDelegatedMint {

    string public name = "POAP Delegated Mint";

    // POAP Contract - Only Mint Token function
    Poap POAPToken;

    // Contract creator
    address public owner;

    // POAP valid token minter
    address public validSigner;

    // Processed signatures
    mapping(bytes => bool) public processed;

    constructor (address _poapContractAddress, address _validSigner) public{
        validSigner = _validSigner;
        POAPToken = Poap(_poapContractAddress);
        owner = msg.sender;
    }

    function _recoverSigner(bytes32 message, bytes memory signature) private pure returns (address) {
        uint8 v;
        bytes32 r;
        bytes32 s;

        (v, r, s) = _splitSignature(signature);
        return ecrecover(message, v, r, s);
    }

    function _splitSignature(bytes memory signature) private pure returns (uint8, bytes32, bytes32) {
        require(signature.length == 65);

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
        // first 32 bytes, after the length prefix
            r := mload(add(signature, 32))
        // second 32 bytes
            s := mload(add(signature, 64))
        // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(signature, 96)))
        }

        return (v, r, s);
    }

    function _isValidData(uint256 _event_id, address _receiver, bytes memory _signature) private view returns(bool) {
        bytes32 message = keccak256(abi.encodePacked(_event_id, _receiver));
        return (_recoverSigner(message, _signature) == validSigner);
    }

    function mintToken(uint256 event_id, address receiver, bytes memory signature) public returns (bool) {
        // Check that the signature is valid
        require(_isValidData(event_id, receiver, signature), "Invalid signature");
        // Check that the signature was not already processed
        require(processed[signature] == false, "Signature already processed");

        processed[signature] = true;
        return POAPToken.mintToken(event_id, receiver);
    }
}
