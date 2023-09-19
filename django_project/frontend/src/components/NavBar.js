import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import {
    AppBar,
    Toolbar,
    CssBaseline,
    Typography,
    makeStyles,
    IconButton,
    Menu,
    MenuItem,
} from "@material-ui/core";
import AccountCircle from '@material-ui/icons/AccountCircle';


const useStyles = makeStyles((theme) => ({
    navlinks: {
        marginRight: theme.spacing(10),
        display: "flex",
    },
    logo: {
        flexGrow: "1",
        cursor: "pointer",
    },
    link: {
        textDecoration: "none",
        color: "white",
        fontSize: "20px",
        marginLeft: theme.spacing(10),
        "&:hover": {
            color: "red",
            borderBottom: "1px solid white",
        },
    },
}));

function ResponsiveAppBar() {

    const classes = useStyles();
    const [anchorEl, setAnchorEl] = useState(null);
    const isMenuOpen = Boolean(anchorEl);

    const { user, logoutUser, loginUser } = useContext(AuthContext);

    const handleLogin = e => {
        e.preventDefault();
        setAnchorEl(null);
        loginUser();
    };

    const handleLogout = e => {
        e.preventDefault();
        setAnchorEl(null);
        logoutUser();
    };
  
    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
      };

    const menuId = 'account-menu';
    const renderMenu = (
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        id={menuId}
        keepMounted
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={isMenuOpen}
        onClose={handleMenuClose}
      >
        {user ? <MenuItem onClick={handleLogout}>Logout</MenuItem>: <MenuItem onClick={handleLogin}>Login</MenuItem>}
      </Menu>
    );

    return (
        <>
            <AppBar position="static">
                <CssBaseline />
                <Toolbar>
                    <Typography variant="h4" className={classes.logo}>
                        W3 Verifiable Credentials
                    </Typography>
                    <div className={classes.navlinks}>
                        {user ? 
                            <>
                                <Link to="/" className={classes.link}>
                                    Home
                                </Link>
                                <Link to="/dashboard" className={classes.link}>
                                    Get Credentials
                                </Link>
                                <Link to="/issue-credential" className={classes.link}>
                                    Issue Credentials
                                </Link>
                                <Link to="/verify-credential" className={classes.link}>
                                    Verify Credential
                                </Link>
                            </> : 
                            <>
                                <Link to="/" className={classes.link}>
                                    Home
                                </Link>
                                <Link to="/verify-credential" className={classes.link}>
                                    Verify Credential
                                </Link> 
                            </>
                        }
                    </div>
                    <IconButton edge="end" aria-controls={menuId} aria-label="account of current user" aria-haspopup="true" onClick={handleProfileMenuOpen} color="inherit">
                        <AccountCircle />
                    </IconButton>
                </Toolbar>
            </AppBar>
            {renderMenu}
        </>             
    );
}

export default ResponsiveAppBar;