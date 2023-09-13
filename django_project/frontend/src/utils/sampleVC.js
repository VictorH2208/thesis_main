const sampleVC = {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://www.w3.org/2018/credentials/examples/v1",
      "https://w3id.org/security/suites/ed25519-2020/v1"
    ],
    "id": 12,
    "type": [
      "VerifiableCredential",
      "UniversityDegreeCredential"
    ],
    "issuer": "0x44829A4d92503950F4f39BA5069E8E965FB2e0EB",
    "issuanceDate": "Fri Aug 04 2023 21:34:59 GMT+0800 (China Standard Time)",
    "credentialSubject": {
      "id": "0x44829A4d92503950F4f39BA5069E8E965FB2e0EB",
      "degree": {
        "type": "BachelorDegree",
        "name": "Bachelor of Applied Science"
      }
    },
    "proof": {
      "type": "ethereum_personal_sign",
      "created": "Fri Aug 04 2023 21:35:16 GMT+0800 (China Standard Time)",
      "proofPurpose": "assertionMethod",
      "verificationMethod": "0x04fc252db78fa700a641c383acd6ed9c2a0ed33bf52737994e771da7a71925a55345b1b98f8cc193e36c0047b40bb6c2a8abf03b3de3a453dd840a74433593ae58",
      "jws": "0xdb7c1a941911c1fbdd0faba34e0999238d975fbb9cbe54e3dbf5a1c9b7cdd0667b79dce875538fc39c9a20095bf4c5f827059e7b812b5af13e99a63b534ac27b1b"
    }
  }
export default sampleVC;