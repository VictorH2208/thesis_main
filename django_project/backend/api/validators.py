from django.core.exceptions import ValidationError
import web3
from web3 import Web3

def validate_lower_case(value):
    if not value.islower():
        raise ValidationError('Must be lowercase')

def is_positive(value):
    if value < 0:
        raise ValidationError('Must be positive')

def is_address(value):
    w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8545"))
    if not w3.is_address(value):
        raise ValidationError('Must be valid ethereum addresss')