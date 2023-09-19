import { useState, useEffect, useContext } from "react";
import AuthContext from "../context/AuthContext";
import useAxios from "../hooks/useAxios";
import sampleSchema from "../utils/schema";
import sampleVC from "../utils/sampleVC";
import Ajv from "ajv";
import axios from "axios";
import { Container, Typography, Input,
    Button, Grid, Modal, makeStyles, 
    Collapse, Table, TableBody, 
    TableCell, TableContainer, TableHead,
    TableRow, Paper, TablePagination} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";

const TokenArtifact = require("../artifacts/contracts/IDToken/IDToken.json");
const contractAddress = require("../artifacts/contracts/IDToken/contract-address.json");
const ethers = require("ethers");

const ajv = new Ajv();
const validate = ajv.compile(sampleSchema);

const VerifyCredential = () => {

    const [selectedFile, setSelectedFile] = useState();
    const [credential, setCredential] = useState();
	const [isSelected, setIsSelected] = useState(false);
    const [msg, setMsg] = useState("");

    useEffect(() => {
        if (selectedFile !== undefined) {
            try {setCredential(JSON.parse(selectedFile)); }
            catch {setMsg("Error: The credential is invalid")}
        }
    }, [selectedFile]);


	const changeHandler = async (event) => {
        var file = event.target.files[0];
		setIsSelected(true);
        var reader = new FileReader();
        reader.onloadend = () => {
            setSelectedFile(reader.result);
          };
        reader.readAsText(file);
	};

    const checkCredentialFormat = async (e, request) => {
        try {
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
        const isValid = await checkCredentialFormat();
        if (!isValid) {
            setMsg('Error: The credential is invalid');
            console.log("shit 1")
            return;
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const [address] = await window.ethereum.request({method:'eth_requestAccounts'});
        const signer = provider.getSigner(address);
        const signed_credential = await signer.signMessage(JSON.stringify(credential));

        const url = 'http://127.0.0.1:8000/api/credential/verify/';
        const data = {
          // no longer needed if using TLS, still vulnerable if someone intercepts signed credential on the client side (before TLS)
          // signed_nonce: nonce, 
          signed_credential: signed_credential,
          credential: credential,
        };
        
        const headers = {
          "Content-Type": "application/json",
        };
        
        axios.post(url, data, { headers })
            .then(response => {
                if (response.status === 200) {
                setMsg('Success: Valid Credential');
                } else {
                setMsg('Error: The credential is invalid');
                }
            })
            .catch(error => {
                setMsg('Error: there are invalid values in its attributes');
            });
        
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
                <Grid item xs={12} align="center">
                    <Collapse in={msg !== ''}>
                        {!(msg.includes("Error")) ? (<Alert severity="success" onClose={() => {setMsg('')}}>{msg}</Alert>) : (<Alert severity="error" onClose={() => {setMsg('')}}>{msg}</Alert>)}
                    </Collapse>
                </Grid>
                <Grid item xs={12}>
                    {isSelected ? (
                        <div>
                            <pre>{selectedFile}</pre>
                        </div>
                    ) : (<div></div>)}
                </Grid>
                <Grid item xs={12} align="center">
                    <Button variant="contained" color="primary" disabled={!isSelected} onClick={handleSubmission}>
                        Verify
                    </Button>
                </Grid>
            </Grid>
        </Container>
    );
};
  
export default VerifyCredential;