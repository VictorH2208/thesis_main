from django.core.exceptions import ValidationError
from web3 import Web3
import numpy as np
import json
    
def random_nonce():
    return np.floor(np.random.rand()*1000000)

def connectWeb3():
    web3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8545"))
    return web3

def connectBlockchain():
    with open('../frontend/src/artifacts/contracts/IDToken/IDToken.json', 'r') as f:
        TokenArtifact = json.load(f)
    with open('../frontend/src/artifacts/contracts/IDToken/contract-address.json', 'r') as f:
        ContractAddress = json.load(f)
    web3 = connectWeb3()
    contract = web3.eth.contract(address=ContractAddress['Contract'], abi=TokenArtifact['abi'])
    signer, *_ = web3.eth.accounts
    return contract,signer,web3