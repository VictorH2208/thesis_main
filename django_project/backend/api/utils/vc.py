sampleCredential = {
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://www.w3.org/2018/credentials/examples/v1",
    "https://w3id.org/security/suites/ed25519-2020/v1"
  ],
  "id": 4,
  "type": [
    "VerifiableCredential",
    "UniversityDegreeCredential"
  ],
  "issuer": "0xA2400417485b3db7713c86b1da60d719e6493F3E",
  "issuanceDate": "Wed Sep 13 2023 23:19:52 GMT-0400 (北美东部夏令时间)",
  "credentialSubject": {
    "id": "0xA2400417485b3db7713c86b1da60d719e6493F3E",
    "degree": {
      "type": "BachelorDegree",
      "name": "Bachelor of Applied Science"
    }
  },
  "proof": {
    "type": "ethereum_personal_sign",
    "created": "Wed Sep 13 2023 23:19:57 GMT-0400 (北美东部夏令时间)",
    "proofPurpose": "assertionMethod",
    "recoveredPubKey": "0x044e9a83d802e534c4eb6221c28f0938c6d81d48f8af30dc8057ef7d2bc15ba0a2ee42e0e123ad31344e37e2006d4f04f7bbf57985cb013fffe92b80334cdb6822",
    "recoverAddress": "0xA2400417485b3db7713c86b1da60d719e6493F3E",
    "verifyAddress": "0xA2400417485b3db7713c86b1da60d719e6493F3E",
    "signature": "0x77ec6326a7e07e709e4e1ae6a3c54f2b403997629f7dbc983e7c68191f21f4113740687971e54274cd2a8d0afa940e415ab9e59806411e866538b72b7055aa851c"
  }
}