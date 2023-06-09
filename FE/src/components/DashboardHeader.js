import { useState, Fragment } from 'react';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Logout from '@mui/icons-material/Logout';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import api from '../service/api';
import '../style/components/DashboardHeader.css';

const DashboardHeader = ({loginInfo}) => {

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const handleLogout = () => {
        const accessToken = sessionStorage.getItem('accessToken');
        // console.log(token)
        api.put('/login/logout', null, 
         {
            headers: {
            Authorization: `Bearer ${accessToken}`
            }
         }
        )
            .then(() => {
            window.location.href = '/';
            })
            .catch((error) => {
            console.error(error);
            if (error.response.status === 403) {
                window.location.href = '/';
            } else {
                console.error(error);
            }
            });
    };

    return (
        <div className='Header'>
            <h1 className='title'><HealthAndSafetyIcon fontSize='large' sx={{ marginRight: 1, padding: 0 }} />KEEP ME</h1>
            <Fragment>
            <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center', marginTop: 2, marginRight: 2 }}>
                <IconButton
                    onClick={handleClick}
                    size="small"
                    sx={{ ml: 2 }}
                    aria-controls={open ? 'account-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                >
                    <Avatar sx={{ width: 70, height: 70, background: '#FFD9D4', color: '#D14D72' }}>{loginInfo.name}</Avatar>
                </IconButton>
            </Box>
            <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                PaperProps={{
                elevation: 0,
                sx: {
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                    mt: 1.5,
                    '& .MuiAvatar-root': {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                    },
                    '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                    },
                },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem onClick={handleClose}>
                    <Avatar /> 
                    {loginInfo.name}
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                        <Logout fontSize="small" />
                    </ListItemIcon>
                    Logout
                </MenuItem>
            </Menu>
            </Fragment>
        </div>
  );
}

export default DashboardHeader;