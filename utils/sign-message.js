const EthCrypto = require('eth-crypto');

function getEnvVariable(name) {
  if (!process.env[name]) {
    console.error(`ENV variable ${name} is required`);
    process.exit(1);
  }
  return process.env[name];
}

function signMessage(pk=null, event, address) {
  const privateKey = pk ? pk : getEnvVariable('SIGNER_PK');
  let params = [
    {type: "uint256", value: event},
    {type: "address", value: address}
  ];

  const message = EthCrypto.hash.keccak256(params);
  return EthCrypto.sign(privateKey, message);
}

module.exports = {
  getEnvVariable,
  signMessage
};
