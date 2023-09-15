from django.urls import path
from . import views

from rest_framework_simplejwt.views import (
    TokenRefreshView as JWTRefreshView,
)



urlpatterns = [
    path('login/nonce/<str:publicAddress>', views.GetNonceView.as_view(), name='get_nonce'),
    path('login/JWT/', views.GetJWTPairView.as_view(), name='token_obtain_pair'),
    path('JWT/refresh/', JWTRefreshView.as_view(), name='token_refresh'),
    path('register/', views.RegisterView.as_view(), name='auth_register'),
    path('issue/<int:id>', views.IssueTokenView.as_view(), name='id_issue'),
    path('credential/request/',views.RequestCredentialView.as_view(),name='request_credential'),
    path('credential/request/list/<int:id>',views.GetCredentialRequestsView.as_view(),name='get_credential_requests'),
    path('credential/issue/<int:id>',views.IssueCredentialView.as_view(),name='issue_credential'),
    path('credential/list/<int:id>',views.GetVerifiableCredentialsView.as_view(),name='get_verifiable_credentials'),
    path('credential/verify',views.VerifyCredentialView.as_view(),name='verify_credential'),
    path('test/', views.testEndPoint, name='test'),
    path('', views.getRoutes)
]
