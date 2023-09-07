from django.db import models
from django.contrib.auth.models import AbstractUser
from .validators import *
import numpy as np
from django.contrib.auth.models import UserManager as BaseUserManager

# Create your models here.
class UserManager(BaseUserManager):
    def _create_user(self, publicAddress, **extra_fields):
        user = self.model(publicAddress=publicAddress, **extra_fields)
        user.save(using=self._db)
        return user

    def create_superuser(self, publicAddress=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self._create_user(publicAddress, **extra_fields)

    def create_user(self, publicAddress=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        extra_fields.setdefault("is_active", True)
        return self._create_user(publicAddress, **extra_fields)

def random_nonce():
    return np.floor(np.random.rand()*1000000)

# Create your models here.
class User(AbstractUser):
    objects = UserManager()
    
    username = None
    first_name = None
    last_name = None
    email = None
    password = None

    publicAddress = models.CharField(max_length=64,blank=False, unique=True, validators=[is_address])
    tokenId = models.CharField(max_length=64,blank=True)
    nonce = models.BigIntegerField(blank=False,validators=[is_positive],default=random_nonce)
    name = models.CharField(max_length=30,blank=True)
    nameshingles = models.TextField(null=True) #json of list of shingles
    dateofbirth = models.DateField(null=True)
    REQUIRED_FIELDS = []
    USERNAME_FIELD = "publicAddress"

    def get_address(self):
        return self.publicAddress

    def get_token(self):
        return self.tokenId

    def __str__(self):
        return self.publicAddress

    def refresh_nonce(self):
        self.nonce = random_nonce()
        self.save()
    
class CredentialRequest(models.Model):
    target = models.ForeignKey(User, on_delete=models.CASCADE, related_name="target",null=True)
    context = models.CharField(max_length=200,blank=False)
    issuer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="issuer",null=True)
    type = models.CharField(max_length=100,blank=False)
    complete = models.BooleanField(blank=False,default=False)

class VerifiableCredential(models.Model):
    json = models.TextField(blank=False)
    holder = models.ForeignKey(User, on_delete=models.CASCADE, related_name="holder",null=True)