from django.apps import AppConfig
import json
from web3 import Web3

def updateFiles(address,deployer,artifact):
    with open('../../src/contracts/contract-address.json','w') as f:
        f.write(json.dumps({ 'Contract': address, 'Deployer': deployer }))
    with open('../../src/contracts/IDToken.json','w') as f:
        f.write(json.dumps(artifact))
    with open('../../django-rest-auth/frontend/src/artifacts/contracts/IDToken/contract-address.json','w') as f:
        f.write(json.dumps({ 'Contract': address, 'Deployer': deployer }))
    with open('../../django-rest-auth/frontend/src/artifacts/contracts/IDToken/IDToken.json','w') as f:
        f.write(json.dumps(artifact))

def deploy_contract():
    with open('../../artifacts/contracts/IDToken.sol/IDToken.json', 'r') as f:
        TokenArtifact = json.load(f)
    web3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8545"))
    deployer, *_ = web3.eth.accounts
    contract = web3.eth.contract(abi=TokenArtifact['abi'],bytecode=TokenArtifact['bytecode'])
    construct_txn = contract.constructor().transact({'from': deployer})
    address = web3.eth.get_transaction_receipt(construct_txn)['contractAddress']
    updateFiles(address,deployer,TokenArtifact)
    send_eth = deployer.sendTransaction({'to':'0x88757cAEBA76299B70096d0F32ED6606FC55AC5b','value':1000})
    web3.eth.get_transaction_receipt(send_eth)

class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    '''def ready(self):
        try:
            deploy_contract()
        except:
            pass
    '''
