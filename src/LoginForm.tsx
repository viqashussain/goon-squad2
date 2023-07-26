import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { Button, Container, Stack } from '@mui/material';

export default function LoginForm({ title, setPassword, setEmail, handleAction }) {
    return (
        <Container maxWidth="sm">
            <div>
                <div className="heading-container">
                    <h1 style={{ textAlign: 'center' }}>
                        Login
                    </h1>
                </div>

                <Stack
                    component="form"
                    spacing={2}
                    noValidate
                    autoComplete="off"
                >
                    <TextField
                        id="email"
                        label="Enter the Email"
                        variant="outlined"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        id="password"
                        label="Enter the Password"
                        variant="outlined"
                        type="password"
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <BasicButtons title={title} handleAction={handleAction} />
                </Stack>
            </div>
        </Container >
    );
}

function BasicButtons({ title, handleAction }) {
    return (
        <Button variant="contained" onClick={handleAction}>{title}</Button>
    );
}