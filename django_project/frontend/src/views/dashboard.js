import useAxios from "../hooks/useAxios";
import AuthContext from "../context/AuthContext";
import Loader from "../utils/loader";
import { useEffect, useState, useContext } from "react";

import { Container, Typography, 
    Button, Grid, InputLabel, 
    FormHelperText, FormControl, 
    Select, makeStyles, MenuItem, 
    Collapse, Table, TableBody, 
    TableCell, TableContainer, TableHead,
    TableRow, Paper, TextField} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import { PDFDownloadLink, Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

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
}));

function DashBoard() {
    const api = useAxios();
    const { user } = useContext(AuthContext);
    const [tokenId, setTokenId] = useState();
    const [hasToken, setHasToken] = useState(false);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get(`http://127.0.0.1:8000/api/issue/${user.user_id}`);
                setTokenId(response.data.tokenId);
                if (response.data.tokenId !== ''){
                    setHasToken(true);
                }
            } catch {}
            setLoading(false);
        };
        fetchData();
    }, []);
    return (<section>{loading ? <Loader /> : <section>{hasToken ? <RequestCredential user={user} tokenId={tokenId}/> : <RegisterToken user={user}/>}</section>}</section>);
}

function RegisterToken({user}) {
    const api = useAxios();
    const classes = useStyles();
    const [fullname, setName] = useState(null);
    const [dateofbirth, setDateOfBirth] = useState(null);
    const [msg, setMsg] = useState('');
    const handleRegister = e => {
        e.preventDefault();
        try {
          api.patch(`http://127.0.0.1:8000/api/issue/${user.user_id}`, {name:fullname,dateofbirth:dateofbirth},{
            headers: {
              "Content-Type": "application/json"
            },
          }).then(response => {
              if (response.status === 200) {
                window.location.reload(false);
              }else{
                setMsg('An error occurred');
              }
          })
        } catch {
            setMsg('An error occurred');
        }
      };
    return (
        <Grid container spacing={3} align="center" style={{ marginTop: 20}}>
            <Grid item xs={12}>
                <form autoComplete="off" onSubmit={handleRegister}>
                    <h2>Register User Token</h2>
                        <div>
                            <TextField label="Name" type="text" size='small' onChange={e => setName(e.target.value)} required variant="outlined"  sx={{mb: 3}} style={{ marginRight: 20}}/>
                            <TextField label="Birthday" type="date" id="dateofbirth"  className={classes.textField} onChange={e => setDateOfBirth(e.target.value)} required
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </div>
                        <div style={{marginTop: 15}}>
                            <Button variant="contained" color="secondary" type="submit">Get ID Token</Button>
                        </div>
                        
                </form>
            </Grid>
        </Grid>
    );
}

function RequestCredential({user,tokenId}) {
    const classes = useStyles();
    const [msg, setMsg] = useState('');
    const [vcs, setVcs] = useState();
    const [loading, setLoading] = useState(true);
    const [credentialType, setCredentialType] = useState('Alumni');
    const api = useAxios();

    useEffect(() => {
        const fetchVerifiableCredentials = async () => {
            try {
              const response = await api.get(`http://127.0.0.1:8000/api/credential/list/${user.user_id}`,{
                headers: {
                  "Content-Type": "application/json"
                }
              })
              setVcs(response.data);
            } catch {}
          };
          fetchVerifiableCredentials();
          setLoading(false);
    }, []);

    const handleChange = (event) => {
        setCredentialType(event.target.value);
    };

    const handleRequestAlumniOfCredential = e => {
        e.preventDefault();
        try {
          api.post(`http://127.0.0.1:8000/api/credential/request/`, {
            userId:user.user_id,
            context:"https://www.w3.org/2018/credentials/examples/v1",
            type:"AlumniCredential",
            issuer:"University of Toronto",
          }, {
            headers: {
            "Content-Type": "application/json"
          }}).then(response => {
              if (response.status === 201) {
                setMsg('Successfully made credential request');
              } else {
                setMsg('An error occured');
              }
          })
        } catch {
            setMsg('An error occured');
        }
      };

    const handleRequestBachelorDegree = e => {
        e.preventDefault();
        try {
            api.post(`http://127.0.0.1:8000/api/credential/request/`, {
            userId:user.user_id,
            context:"https://www.w3.org/2018/credentials/examples/v1",
            type:"UniversityDegreeCredential",
            issuer:"University of Toronto",
            }, {
            headers: {
            "Content-Type": "application/json"
            }}).then(response => {
                if (response.status === 201) {
                setMsg('Successfully made credential request');
                } else {
                setMsg('An error occured');
                }
            })
        } catch {
            setMsg('An error occured');
        }
    };

    const handleDownloadCredentail = param => e => {
        e.preventDefault();
        const file = new Blob([JSON.stringify(param, null, 2)], {type: 'text/plain'});
        const element = document.createElement("a");
        element.href = URL.createObjectURL(file);
        element.download = "VC.txt";
        document.body.appendChild(element);
        element.click();
    }

    const styles = StyleSheet.create({
        page: {
            flexDirection: 'row',
            backgroundColor: '#E4E4E4'
        },
        section: {
            margin: 10,
            padding: 10,
            flexGrow: 1
        }
    });  

    return (
        <Container maxWidth="lg">
            {loading ? <Loader /> : (
                <div>
                    <Grid container spacing={1} align="center" style={{ marginTop: 20}}>
                        <Grid item xs={12}>
                            <Typography component="h3" variant="h3">
                                This is the Get Credential Page
                            </Typography>
                        </Grid>
                        {loading ? <Loader /> : null}
                        <Grid item xs={12} style={{ marginTop: 30}}>
                            <Typography component="h5" variant="h5">
                                User Token ID: {tokenId}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} style={{ display: "flex" , alignItems: "center", justifyContent: "center", width: "100%" , gap: "1rem", marginTop: 30}} >
                            <Typography component="h5" variant="h5">
                                <Button variant="contained" color="primary" onClick={credentialType === "Alumni" ? handleRequestAlumniOfCredential : handleRequestBachelorDegree}>Request Credential</Button>
                            </Typography>
                            <FormControl className={classes.formControl}>
                                <InputLabel id="simple-select-label">Credential Type</InputLabel>
                                <Select
                                labelId="simple-select-label"
                                id="simple-select"
                                value={credentialType}
                                onChange={handleChange}
                                >
                                    <MenuItem value={"Alumni"}>Alumni Credential</MenuItem>
                                    <MenuItem value={"Bachelor"}>Bachelor Degree Credential</MenuItem>
                                </Select>
                                <FormHelperText>Select the type of credential you want to request</FormHelperText>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} align="center">
                            <Collapse in={msg !== ''}>
                                {msg !== "An error occured" ? (<Alert severity="success" onClose={() => {setMsg('')}}>{msg}</Alert>) : (<Alert severity="error" onClose={() => {setMsg('')}}>{msg}</Alert>)}
                            </Collapse>
                        </Grid>
                    </Grid>
                    <Typography component="h5" variant="h5" style={{ marginTop: 30}}>
                        Your Verifiable Credentials
                    </Typography>
                    <TableContainer component={Paper}  style={{ marginTop: 15}}>
                        <Table className={classes.table} size="small" aria-label="Your Verifiable Credentials">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Verifiable Credentials ID</TableCell>
                                    <TableCell>Type of Verifiable Credentials</TableCell>
                                    <TableCell align="right">Download</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {vcs ? vcs.map((vc) => (
                                        <TableRow key={vc.id}>
                                            <TableCell component="th" scope="row">{vc.id}</TableCell>
                                            <TableCell align="left">{
                                                JSON.parse(vc.json).type[1]
                                            }</TableCell>
                                            <TableCell align="right">
                                                <Button variant="contained" color="primary" onClick={handleDownloadCredentail(JSON.parse(vc.json))}>Download as Txt</Button>
                                                <Button variant="contained" color="secondary">
                                                    <PDFDownloadLink document={
                                                        <Document>
                                                            <Page size="A4" style={styles.page}>
                                                            <View style={styles.section}>
                                                                <Text>{JSON.stringify(JSON.parse(vc.json), null, 2)}</Text>
                                                            </View>
                                                            </Page>
                                                        </Document>
                                                    } fileName="VC.pdf">
                                                        {({ blob, url, loading, error }) => ('Download as PDF')}
                                                    </PDFDownloadLink>
                                                </Button>
                                            </TableCell>
                                        </TableRow>)) : null }
                            </TableBody>
                        </Table>
                    </TableContainer>
            </div>
            
            )}
        </Container>
    );
}

export default DashBoard;