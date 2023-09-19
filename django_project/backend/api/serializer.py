from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed, ValidationError
from django.contrib.auth import get_user_model
from .validators import is_address
from .utils.deduplicate import deduplicate
from .models import CredentialRequest, VerifiableCredential
from .utils.utils import *
import json
from web3 import Web3
from eth_account.messages import encode_defunct


User = get_user_model()

class GetNonceSerializer(serializers.ModelSerializer):
    nonce = serializers.IntegerField(read_only=True)
    class Meta:
        model = User
        fields = ('nonce',)

class GetJWTPairSerializer(TokenObtainPairSerializer):
    publicAddress = serializers.CharField(write_only=True,required=True)
    signature = serializers.CharField(write_only=True,required=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        del self.fields['password']

    def validate(self,attrs):
        self.user = User.objects.get(publicAddress=attrs['publicAddress'])
        nonce = self.user.nonce
        web3 = connectWeb3()
        message = encode_defunct(text="Login with Metamask by signing nonce: " + str(nonce))
        signature = attrs['signature'][2:]
        account = web3.eth.account.recover_message(message, signature=signature)
        if not account == attrs['publicAddress']:
            raise AuthenticationFailed({'publicAddress_no_match':'public address does not match'})

        refresh = self.get_token(self.user)

        attrs["refresh"] = str(refresh)
        attrs["access"] = str(refresh.access_token)


        return attrs
    
    @classmethod
    def get_token(cls, user):
        jwt = super().get_token(user)
        jwt['publicAddress'] = user.publicAddress
        jwt['user_id'] = user.id
        # ...
        return jwt

class IssueTokenSerializer(serializers.ModelSerializer):
    publicAddress = serializers.CharField(required=True)
    tokenId = serializers.CharField(read_only=True)
    name = serializers.CharField(write_only=True,required=True)
    dateofbirth = serializers.DateField(write_only=True,required=True)

    class Meta:
        model = User
        fields = ('id','publicAddress','name','dateofbirth','tokenId',)

    def update(self, instance, validated_data):
        exists_, shingles = deduplicate(validated_data['name'],validated_data['dateofbirth'],c=2,t=3)
        if exists_:
            print('person already registered')
            raise ValidationError

        contract,signer,web3 = connectBlockchain()

        exists_ = False
        try:
            tx_issue = contract.functions.issue(instance.publicAddress,"uri").transact({'from':signer})
            web3.eth.wait_for_transaction_receipt(tx_issue)
        except:
            exists_ = True
            raise ValidationError
        if not exists_:
            newtoken = contract.functions.tokenOf(instance.publicAddress).call()
            instance.tokenId = newtoken
            instance.name = validated_data['name']
            instance.nameshingles = json.dumps(shingles)
            instance.dateofbirth = validated_data['dateofbirth']
            instance.save()
        print(instance)
        return instance

class IssueCredentialSerializer(serializers.ModelSerializer):
    credentialJSON = serializers.CharField(write_only=True,required=True)
    pubKey = serializers.CharField(write_only=True,required=True)
    target = serializers.StringRelatedField(read_only=True)
    context = serializers.CharField(read_only=True)
    issuer = serializers.StringRelatedField(read_only=True)
    type = serializers.CharField(read_only=True)
    complete = serializers.BooleanField()
    class Meta:
        model = CredentialRequest
        fields = ('id','credentialJSON','pubKey','target','context','issuer','type','complete',)
    
    def update(self,instance,validated_data):
        contract,signer,web3 = connectBlockchain()
        request = self.context.get("request")
        if request and hasattr(request, "user"):
            user = request.user
        hash = Web3.keccak(hexstr=validated_data['pubKey'][4:])
        PA = Web3.to_checksum_address(Web3.to_hex(hash[-20:]))
        print("What the fuck:", PA, user.publicAddress)
        if PA != user.publicAddress:
            raise ValidationError
        try:
            tx_addCredential = contract.functions.addCredential(instance.id,validated_data['pubKey'],user.publicAddress).transact({'from':signer})
            web3.eth.wait_for_transaction_receipt(tx_addCredential)
        except:
            raise ValidationError
        vc = VerifiableCredential.objects.create(json=validated_data['credentialJSON'],holder=instance.target)
        instance.complete=True
        instance.save()
        return instance

class GetCredentialRequestsSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    target = serializers.StringRelatedField(read_only=True)
    context = serializers.CharField(read_only=True)
    issuer = serializers.StringRelatedField(read_only=True)
    type = serializers.CharField(read_only=True)
    complete = serializers.BooleanField(read_only=True)
    class Meta:
        model = CredentialRequest
        fields = ('id','target','context','issuer','type','complete',)

class GetVerifiableCredentialsSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    holder = serializers.StringRelatedField(read_only=True)
    json = serializers.CharField(read_only=True)
    class Meta:
        model = CredentialRequest
        fields = ('id','holder','json',)

class RequestCredentialSerializer(serializers.ModelSerializer):
    userId = serializers.IntegerField(write_only=True,required=True)
    context = serializers.CharField(write_only=True, required=True)
    issuer = serializers.CharField(write_only=True, required=True)
    type = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = CredentialRequest
        fields = ('userId','context','issuer','type',)

    def validate(slf,attrs):
        data = attrs.copy()
        data['issuerAddress'] = User.objects.get(id=1).publicAddress
        data['issuer'] = User.objects.get(publicAddress=data['issuerAddress'])
        data['target'] = User.objects.get(id=data['userId'])
        return data
    
    def create(self, validated_data):
        newrequest = CredentialRequest.objects.create(
            target=validated_data['target'],
            context=validated_data['context'],
            issuer=validated_data['issuer'],
            type=validated_data['type'],
            complete=False,
        )
        
        newrequest.save()
        return newrequest

class RegisterSerializer(serializers.ModelSerializer):
    publicAddress = serializers.CharField(write_only=True, required=True)
    nonce = serializers.IntegerField(read_only=True)

    class Meta:
        model = User
        fields = ('publicAddress','nonce')

    def validate(self, attrs):
        data = attrs.copy()
        data['publicAddress'] = data['publicAddress']
        is_address(data['publicAddress'])
        return data

    def create(self, validated_data):
        user = User.objects.create_user(
            publicAddress=validated_data['publicAddress']
        )
        return user
