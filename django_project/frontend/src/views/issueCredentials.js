import { useEffect, useState, useContext } from "react";
import useAxios from "../hooks/useAxios";
import AuthContext from "../context/AuthContext";
import Loader from "../utils/loader";
import { Container, Typography, 
    Button, Grid, Modal, makeStyles, 
    Collapse, Table, TableBody, 
    TableCell, TableContainer, TableHead,
    TableRow, Paper, TablePagination} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";

const TokenArtifact = require("../artifacts/contracts/IDToken/IDToken.json");
const contractAddress = require("../artifacts/contracts/IDToken/contract-address.json");
const ethers = require("ethers");

const useStyles = makeStyles((theme) => ({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
    },
    selectEmpty: {
      marginTop: theme.spacing(2),
    },
    table: {
        minWidth: 650,
    },
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: 200,
    },
    paper: {
        position: 'absolute',
        width: 1000,
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
}));
  
function getModalStyle() {
    const top = 50;
    const left = 50;

    return {
        top: `${top}%`,
        left: `${left}%`,
        transform: `translate(-${top}%, -${left}%)`,
    };
}

function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
}

function getComparator(order, orderBy) {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }
  
function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}

function IssueCredential() {
    const api = useAxios();
    const classes = useStyles();
    
    const [loading, setLoading] = useState(true);
    const [reqs, setReqs] = useState("");
    const [current, setCurrent] = useState("");
    const { user } = useContext(AuthContext);
    const [newCredentialPretty, setNewCredentialPretty] = useState("");
    const [newCredential, setNewCredential] = useState("");
    const [contract, setContract] = useState();
    const [txConnection, setTxConnection] = useState(null);
    const [signer, setSigner] = useState(null);
    const [provider, setProvider] = useState(null);
    const [msg, setMsg] = useState("");
    const [pubKey, setPubKey] = useState("");
    const [unsigned, SetUnsigned] = useState(null);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('Request ID');
    const [open, setOpen] = useState(false);

    const [modalStyle] = useState(getModalStyle);

    useEffect(() => {
        const fetchCredentialRequests = async () => {
            try {
                const response = await api.get(`http://127.0.0.1:8000/api/credential/request/list/${user.user_id}`,{
                headers: {
                    "Content-Type": "application/json"
                }
                })
                setReqs(response.data);
            } catch {
                setReqs("Something went wrong");
            }
        };
        fetchCredentialRequests();
        const connectContract = async () => {
            let provider = await new ethers.providers.Web3Provider(window.ethereum);
            const [address] = await window.ethereum.request({method:'eth_requestAccounts'});

            const deployer = provider.getSigner(contractAddress.Deployer);
            const tokenContract = await new ethers.Contract(contractAddress.Contract,TokenArtifact.abi,deployer);
            setContract(tokenContract);

            const signer = provider.getSigner(address);
            const txConnect = tokenContract.connect(signer);
            setSigner(signer);
            setTxConnection(txConnect);
            setProvider(provider);
        }
        connectContract();
        setLoading(false);
    }, []);

    const createSampleCredential = async (e, selected) => {
        var credential;
        if (selected.type === 'AlumniCredential'){
            credential = {
                "@context":["https://www.w3.org/2018/credentials/v1",selected.context,"https://w3id.org/security/suites/ed25519-2020/v1"],
                "id":selected.id,
                "type": [
                "VerifiableCredential",
                selected.type
                ],
                "issuer": await signer.getAddress(),
                "issuanceDate": Date().toLocaleString(),
                "credentialSubject":{
                "id":selected.target,
                "alumniOf":{
                    "id":await signer.getAddress(),
                    "name":[{
                    "value": "University of Toronto",
                    "lang": "en"
                    }]
                }
                }
            }
        } else if (selected.type === 'UniversityDegreeCredential') {
            credential = {
                "@context":["https://www.w3.org/2018/credentials/v1",selected.context,"https://w3id.org/security/suites/ed25519-2020/v1"],
                "id":selected.id,
                "type": [
                "VerifiableCredential",
                selected.type
                ],
                "issuer": await signer.getAddress(),
                "issuanceDate": Date().toLocaleString(),
                "credentialSubject":{
                "id":selected.target,
                "degree": {
                    "type": "BachelorDegree",
                    "name": "Bachelor of Applied Science"
                }
                }
            }
        }
        SetUnsigned(credential);
        setOpen(true);
    }

    const handleSelectRequest = async (e,request) => {
        var selected;
        e.preventDefault();
        try {
            const response = await api.get(`http://127.0.0.1:8000/api/credential/issue/${request.id}`,{
                headers: {
                "Content-Type": "application/json"
                }
            })
            selected = response.data;
            setCurrent(selected);
        } catch {
            setCurrent("Something went wrong");
        }
        createSampleCredential(e, selected);
    }

    const handleCreateCredential = async (e, request) => {
        e.preventDefault();
        if (unsigned === null || request.id !== current.id) {
            setMsg('Error: You have not yet pressed the select and view button');
            return;
        }

        const msgHash = ethers.utils.hashMessage(JSON.stringify(unsigned));
        const msgBytes = ethers.utils.arrayify(msgHash) // create binary hash
        const signature = await signer.signMessage(JSON.stringify(unsigned));
        const recoveredPubKey = ethers.utils.recoverPublicKey(msgBytes, signature);
        const recoverAddress = ethers.utils.recoverAddress(msgBytes, signature);
        const verifyAddress = ethers.utils.verifyMessage(JSON.stringify(unsigned), signature);
        setPubKey(recoveredPubKey);

        const proof = {'proof':{
            "type":"ethereum_personal_sign",
            "created": Date().toLocaleString(),
            "proofPurpose": "assertionMethod",
            "recoveredPubKey": recoveredPubKey,
            "recoverAddress": recoverAddress,
            "verifyAddress": verifyAddress,
            "msgBytes": msgBytes,
            "signature":signature,
        }}
        const vc = JSON.stringify(Object.assign({}, unsigned, proof));
        setNewCredentialPretty(JSON.stringify(JSON.parse(vc), null, 2))
        setNewCredential(vc);
        setMsg('Successfully created credential for user.');
        SetUnsigned(null);
    }

    const handleSubmitCredential = async (e, request) => {
        e.preventDefault();
        if (current.id !== request.id) {
            setMsg('Error: The current credential is not the same as the one you created');
            return;
        }
        const response = await api.patch(`http://127.0.0.1:8000/api/credential/issue/${current.id}`,{credentialJSON:newCredential,pubKey:pubKey},{
            headers: {
            "Content-Type": "application/json"
            },
        });
        if (response.status === 200) {
            window.location.reload(false);
            setMsg('Successfully upload credential for user.');
        }else{
            setMsg('Error');
        };
    }

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleOpen = () => {
        setOpen(true);
    };

    const body = (
        <div style={modalStyle} className={classes.paper}>
          <h2 id="simple-modal-title">Preview</h2>
            {unsigned ? <pre><code>{JSON.stringify(unsigned, null, 2)}</code></pre> : <pre><code>{newCredentialPretty}</code></pre>}
        </div>
    );

    return (
        <Container maxWidth="xl">
            {loading ? <Loader /> : (
                <div>
                    <Typography component="h5" variant="h5" style={{ marginTop: 20}}>
                        All Credential Requests
                    </Typography>
                    <TableContainer component={Paper} style={{marginTop: "15px"}}>
                        <Table className={classes.table} size="small" aria-label="Your Verifiable Credentials">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Request ID</TableCell>
                                    <TableCell>Requestor</TableCell>
                                    <TableCell>Context</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Issued?</TableCell>
                                    <TableCell>Create Credential</TableCell>
                                    <TableCell align="right">Upload Credential</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                            {reqs? stableSort(reqs, getComparator(order, orderBy))
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((request, index) => {
                                return (
                                    <TableRow key={request.id}>
                                        <TableCell component="th" scope="row">{request.id}</TableCell>
                                        <TableCell align="left">{request.target}</TableCell>
                                        <TableCell align="left">{request.context}</TableCell>
                                        <TableCell align="left">{request.type}</TableCell>
                                        <TableCell align="left">{request.complete.toString()}</TableCell>
                                        <TableCell align="left">
                                            <Button variant="contained" color="primary" onClick={(e) => request.complete ? null : handleSelectRequest(e, request)} disabled={request.complete}>
                                                Select and view
                                            </Button>
                                            <Button variant="contained" color="secondary" onClick={(e) => request.complete ? null : handleCreateCredential(e, request)} disabled={request.complete}>
                                                Create
                                            </Button>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Button variant="contained" color="primary" onClick={handleOpen} disabled={request.complete}>
                                                View
                                            </Button>
                                            <Button variant="contained" color="secondary" onClick={(e) => request.complete ? null : handleSubmitCredential(e, request)} disabled={request.complete}>
                                                Submit
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            }) : null}
                                
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={reqs.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                    <Grid container spacing={2} style={{ marginTop: "15px"}}>
                        <Grid item xs={12} align="center">
                            <Modal
                                open={open}
                                onClose={handleClose}
                                aria-labelledby="simple-modal-title"
                                aria-describedby="simple-modal-description"
                            >
                                {body}
                            </Modal>
                        </Grid>
                        <Grid item xs={12} align="center">
                            <Collapse in={msg !== ''}>
                                {!(msg.includes("Error")) ? (<Alert severity="success" onClose={() => {setMsg('')}}>{msg}</Alert>) : (<Alert severity="error" onClose={() => {setMsg('')}}>{msg}</Alert>)}
                            </Collapse>
                        </Grid>
                    </Grid>
                </div>
            )}
        </Container>
    );
}

export default IssueCredential;