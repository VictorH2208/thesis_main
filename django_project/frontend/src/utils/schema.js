const sampleSchema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "properties": {
      "@context": {
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "id": {
        "type": "integer"
      },
      "type": {
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "issuer": {
        "type": "string"
      },
      "issuanceDate": {
        "type": "string"
      },
      "credentialSubject": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "degree": {
            "type": "object",
            "properties": {
              "type": {
                "type": "string"
              },
              "name": {
                "type": "string"
              }
            },
            "required": ["type", "name"]
          }
        },
        "required": ["id"]
      },
      "proof": {
        "type": "object",
        "properties": {
          "type": {
            "type": "string"
          },
          "created": {
            "type": "string"
          },
          "proofPurpose": {
            "type": "string"
          },
          "verificationMethod": {
            "type": "string"
          },
          "jws": {
            "type": "string"
          }
        },
        "required": ["type", "created", "proofPurpose", "verificationMethod", "jws"]
      }
    },
    "required": ["@context", "id", "type", "issuer", "issuanceDate", "credentialSubject", "proof"]
  }

export default sampleSchema;