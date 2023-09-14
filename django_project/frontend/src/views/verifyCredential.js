import { useState, useEffect, useContext } from "react";
import AuthContext from "../context/AuthContext";
import sampleSchema from "../utils/schema";
import sampleVC from "../utils/sampleVC";
import Ajv from "ajv";
import { Container, Typography, Input,
    Button, Grid, Modal, makeStyles, 
    Collapse, Table, TableBody, 
    TableCell, TableContainer, TableHead,
    TableRow, Paper, TablePagination} from "@material-ui/core";

const TokenArtifact = require("../artifacts/contracts/IDToken/IDToken.json");
const contractAddress = require("../artifacts/contracts/IDToken/contract-address.json");
const ethers = require("ethers");

const ajv = new Ajv();
const validate = ajv.compile(sampleSchema);

const VerifyCredential = () => {
    const { authTokens, user } = useContext(AuthContext);
    const [selectedFile, setSelectedFile] = useState();
    const [credential, setCredential] = useState();
	const [isSelected, setIsSelected] = useState(false);
    const [msg, setMsg] = useState("");

	const changeHandler = (event) => {
        var file = event.target.files[0];

		setIsSelected(true);
        var reader = new FileReader();
        reader.onload = function (event) {
            setSelectedFile(event.target.result);
        };
        reader.readAsText(file);
	};

    const checkCredentialFormat = async (e, request) => {
        try {
            setCredential(JSON.parse(selectedFile));
            const valid = validate(credential);
    
            if (valid) {
                return true;
            } else {
                console.error('Validation errors:', validate.errors);
                return false;
            }
        } catch (error) {
            console.error('Error parsing JSON:', error);
            return false;
        }
	};

	const handleSubmission = async (e, request) => {

        // Check schema validity (possible sync issue first time not working)
        // const isValid = await checkCredentialFormat();
        // if (!isValid) {
        //     setMsg('Error: The credential is not valid');
        //     console.log("shit 1")
        //     return;
        // }

        setCredential(sampleVC);

        console.log("verifying credential")

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const [address] = await window.ethereum.request({method:'eth_requestAccounts'});
        const signer = provider.getSigner(address);
        //Check if credential subject is the same as the current user
        const current_user_address = await signer.getAddress();
        if (credential.credentialSubject.id !== current_user_address) {
            setMsg('Error: The current user does not match the credential subject');
            console.log(msg);
            return;
        }

        //compute the address using pubkey
        const addressFromPublicKey = ethers.utils.computeAddress(credential.proof.recoveredPubKey);
        if (credential.issuer !== addressFromPublicKey) {
            setMsg('Error: The issuer did not sign this proof.');
            console.log(msg);
            return;
        }

        //Connecting to contract and retrieve pubkey and address
        // const contract = new ethers.Contract(contractAddress, TokenArtifact.abi, provider.getSigner(contractAddress.Deployer));
        // try {
        //     const signerAddress = await contract.signerOf(1);
        //     console.log("Signer of the credential:", signerAddress);
        // } catch (error) {
        //     console.error("Error calling 'signerOf' function:", error);
        // }

        //Verify privateKey and publicKey matches
        const unsigned = JSON.parse(JSON.stringify(credential));
        delete unsigned.proof;
        const addressFromMsg = ethers.utils.verifyMessage(JSON.stringify(unsigned), credential.proof.signature);
        if (addressFromMsg !== credential.issuer) {
            setMsg('Error: The private key does not match the signature');
            console.log(msg);
            return;
        }
	};

    return (
        <Container maxWidth="xl">
            <Grid container spacing={1} style={{ marginTop: 20}}>
                <Grid item xs={12} align="center">
                    <Typography component="h3" variant="h3">
                        This is the Verify Credential Page
                    </Typography>
                </Grid>
                <Grid item xs={12} style={{ marginTop: 30}} align="center">
                    <Input type="file" color="primary" onChange={changeHandler} />
                </Grid>
                <Grid item xs={12}>
                    {isSelected ? (
                        <div>
                            <pre>{selectedFile}</pre>
                        </div>
                    ) : (<div></div>)}
                </Grid>
                <Grid item xs={12} align="center">
                    <Button variant="contained" color="primary" onClick={handleSubmission}>
                        Verify
                    </Button>
                </Grid>

            </Grid>
        </Container>
    );
};
  
export default VerifyCredential;