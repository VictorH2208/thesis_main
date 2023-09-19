sampleCredential = {
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://www.w3.org/2018/credentials/examples/v1",
    "https://w3id.org/security/suites/ed25519-2020/v1"
  ],
  "id": 2,
  "type": [
    "VerifiableCredential",
    "AlumniCredential"
  ],
  "issuer": "0xA2400417485b3db7713c86b1da60d719e6493F3E",
  "issuanceDate": "Sun Sep 17 2023 00:22:21 GMT-0400 (Eastern Daylight Time)",
  "credentialSubject": {
    "id": "0xA2400417485b3db7713c86b1da60d719e6493F3E",
    "alumniOf": {
      "id": "0xA2400417485b3db7713c86b1da60d719e6493F3E",
      "name": [
        {
          "value": "University of Toronto",
          "lang": "en"
        }
      ]
    }
  },
  "proof": {
    "type": "ethereum_personal_sign",
    "created": "Sun Sep 17 2023 00:22:24 GMT-0400 (Eastern Daylight Time)",
    "proofPurpose": "assertionMethod",
    "verificationMethod": "0x044e9a83d802e534c4eb6221c28f0938c6d81d48f8af30dc8057ef7d2bc15ba0a2ee42e0e123ad31344e37e2006d4f04f7bbf57985cb013fffe92b80334cdb6822",
    "proofValue": "0xb2ab240faf745a2a019e3605db1064e8814fff90aba7830f4c365055f6de8ed96c7f35f88b8efaa084db5da58d6672491b37dea3eafb31922dc5a06d00039a741c"
  }
}