import { useState, useEffect, useContext } from "react";
import AuthContext from "../context/AuthContext";
import { Container, Typography, Input,
    Button, Grid, Modal, makeStyles, 
    Collapse, Table, TableBody, 
    TableCell, TableContainer, TableHead,
    TableRow, Paper, TablePagination} from "@material-ui/core";

const VerifyCredential = () => {
    const { user } = useContext(AuthContext);
    const [selectedFile, setSelectedFile] = useState();
	const [isSelected, setIsSelected] = useState(false);

	const changeHandler = (event) => {
        var file = event.target.files[0];

		setIsSelected(true);
        var reader = new FileReader();
        reader.onload = function (event) {
            setSelectedFile(event.target.result);
        };
        reader.readAsText(file);
	};

	const handleSubmission = () => {
        console.log("Verifying");
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
                    <Button variant="contained" color="primary" disabled={!isSelected} onClick={handleSubmission}>
                        Verify
                    </Button>
                </Grid>

            </Grid>
        </Container>
    );
};
  
export default VerifyCredential;