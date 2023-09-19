sampleSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "@context": {
      "type": "array",
      "items": {
        "type": "string",
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
      "type": "string",
    },
    "credentialSubject": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string"
        },
        "alumniOf": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            },
            "name": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "value": {
                    "type": "string"
                  },
                  "lang": {
                    "type": "string"
                  }
                },
                "required": ["value"]
              }
            }
          },
          "required": ["id"]
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
          "type": "string",
        },
        "proofPurpose": {
          "type": "string"
        },
        "verificationMethod": {
          "type": "string"
        },
        "proofValue": {
          "type": "string"
        }
      },
      "required": ["type", "created", "proofPurpose", "verificationMethod", "proofValue"]
    }
  },
  "required": ["@context", "id", "type", "issuer", "issuanceDate", "credentialSubject", "proof"]
}