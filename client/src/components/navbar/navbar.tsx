import React from 'react'
import AppBar from '@material-ui/core/AppBar'
import IconButton from '@material-ui/core/IconButton'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import DriverIcon from '@material-ui/icons/DriveEta';

const Navbar: React.FC = () => {
    return (
        <AppBar position="static">
            <Toolbar>
                <IconButton edge="start" color="inherit" aria-label="menu">
                    <DriverIcon />
                </IconButton>
                <Typography variant="h6">Code Delivery</Typography>
            </Toolbar>
        </AppBar>
        
    )
}

export default Navbar
