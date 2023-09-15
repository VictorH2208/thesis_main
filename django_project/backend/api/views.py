from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, APIView
from rest_framework.response import Response
from django.http import JsonResponse, HttpResponse
from api.serializer import (GetJWTPairSerializer, RegisterSerializer, IssueTokenSerializer,
            RequestCredentialSerializer, GetCredentialRequestsSerializer, IssueCredentialSerializer, GetNonceSerializer,
            GetVerifiableCredentialsSerializer)
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from api.models import CredentialRequest, VerifiableCredential
from .utils.utils import *
from web3 import Web3
from .utils.vc import *
from .utils.schema import *
import jsonschema
from jsonschema import validate

User = get_user_model()

class GetNonceView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = GetNonceSerializer
    lookup_field = 'publicAddress'

    def get(self, request, *args, **kwargs):
        self.get_object().refresh_nonce()
        return super().get(request,*args,**kwargs)

class GetJWTPairView(TokenObtainPairView):
    serializer_class = GetJWTPairSerializer
    permission_classes = (AllowAny,)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

class IssueTokenView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    permission_classes = (IsAuthenticated,)
    serializer_class = IssueTokenSerializer
    lookup_field = 'id'

class RequestCredentialView(generics.CreateAPIView):
    queryset = CredentialRequest.objects.all()
    permission_classes = (IsAuthenticated,)
    serializer_class = RequestCredentialSerializer

class GetCredentialRequestsView(generics.ListAPIView):
    queryset = CredentialRequest.objects.all()
    permission_classes = (IsAuthenticated,)
    serializer_class = GetCredentialRequestsSerializer
    
    def get_queryset(self, *args, **kwargs):
        user = User.objects.get(id=self.kwargs.get('id'))
        return super().get_queryset(*args, **kwargs).filter(
            issuer=user,
        )

class GetVerifiableCredentialsView(generics.ListAPIView):
    queryset = VerifiableCredential.objects.all()
    permission_classes = (IsAuthenticated,)
    serializer_class = GetVerifiableCredentialsSerializer
    
    def get_queryset(self, *args, **kwargs):
        user = User.objects.get(id=self.kwargs.get('id'))
        return super().get_queryset(*args, **kwargs).filter(
            holder=user,
        )

class IssueCredentialView(generics.RetrieveUpdateAPIView):
    queryset = CredentialRequest.objects.all()
    permission_classes = (IsAuthenticated,)
    serializer_class = IssueCredentialSerializer
    lookup_field = 'id'

class VerifyCredentialView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        nonce = request.data.get("signed_nonce")
        signed_credential = request.data.get("signed_credential")
        credential = sampleCredential

        contract,signer,web3 = connectBlockchain();

        # schema check
        try:
            if isinstance(credential, dict):
                validate(instance=credential, schema=sampleSchema)
            else:
                return HttpResponse("error: the credential is not in json format", status=400)
        except:
            return HttpResponse("error: the credential is not valid", status=400)




        # nounce check and subject user check



        # Check address correspond to public key




        # connect to the block chain and retrieve info of credential transaction receipt.
        signer_of_credential = contract.functions.signerOf(credential["id"]).call();
        pubkey_of_credential = contract.functions.pubKeyOf(credential["id"]).call();
        if signer_of_credential != credential["issuer"]:
            return HttpResponse("error: issuer address does not match the one on the blockchain", status=400)
        if Web3.to_hex(pubkey_of_credential) != credential['proof']['recoveredPubKey']:
            return HttpResponse("error: public key does not match the one on the blockchain", status=400)

        # # private key and public key check by verifying the signature
        # proof = credential.pop("proof", None)
        # recovered_address = Account.recover_message(json.dumps(credential), signature=proof["signature"])






        return HttpResponse("Hello")




@api_view(['GET'])
def getRoutes(request):
    print(request)
    routes = [
        '/api/login/nonce/',
        '/api/login/JWT/',
        '/api/JWT/refresh/',
        '/api/register/',
        '/api/issue/',
        '/api/credential/request/',
        '/api/credential/request/list/',
        '/api/credential/issue/',
        '/api/credential/list/',
    ]
    return Response(routes)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def testEndPoint(request):
    if request.method == 'GET':
        data = f"Congratulation {request.user}, your API just responded to GET request"
        return Response({'response': data}, status=status.HTTP_200_OK)
    elif request.method == 'POST':
        text = request.POST.get('text')
        data = f'Congratulation your API just responded to POST request with text: {text}'
        return Response({'response': data}, status=status.HTTP_200_OK)
    return Response({}, status.HTTP_400_BAD_REQUEST)