import { useEffect, useState } from 'react';
import './App.css';
import "ag-grid-community/styles/ag-grid.css";
import 'ag-grid-community/styles/ag-theme-alpine.css';
import {
  Routes,
  Route,
  useNavigate
} from "react-router-dom";
import Table from './Table';
import Predictions from './Predictions';
import { toast, ToastContainer } from 'react-toastify';
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, logInWithEmailAndPassword, logout } from "./firebase";
import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import LoginForm from './LoginForm';
import { PrivateRoute } from './PrivateRoute';
import { Loading } from './Loading';
import 'react-toastify/dist/ReactToastify.css';


function App() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, loading] = useAuthState(auth);

  const navigate = useNavigate();

  useEffect(() => {
    if (loading) {
      // maybe trigger a loading screen
      return;
    }
    if (!user) navigate("/login");
  }, [user, loading]);

  const handleLogin = () => {
    // const authentication = getAuth();
    logInWithEmailAndPassword(email, password)
      .then((response) => {
        // navigate('/')
        navigate("/");
      })
      .catch((error) => {
        debugger;
        console.log(error.code)
        if (error.code === 'auth/wrong-password') {
          toast.error('Please check the Password');
        }
        if (error.code === 'auth/user-not-found') {
          toast.error('Please check the Email');
        }
      })
  }

  if (loading) {
    return (
      <Loading />
    )
  }

  return (
    <div>

      <Box sx={{ flexGrow: 1 }}>
        <AppBar style={{ background: '#EF0107' }} position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Goon Squad
            </Typography>
            {user ?
              <Button
                onClick={() => navigate('predictions')}
                key='myPredictions'
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                My Predictions
              </Button>
              : null
            }

            {user ?
              <Button
                onClick={() => navigate('')}
                key='table'
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                Table
              </Button>
              : null
            }
            {user ?
              <Button color="inherit" onClick={() => { logout(); }} >Log Out</Button>
              : null
            }

          </Toolbar>
        </AppBar>
      </Box>

      <Routes>
        <Route path='/' element={<PrivateRoute />}>
          <Route path='/' element={<Table />} />
        </Route>
        <Route path='/' element={<PrivateRoute />}>
          <Route path='/predictions' element={<Predictions />} />
        </Route>
        {/* <RouteRequiresLogin path="/">
          <Table />
        </RouteRequiresLogin> */}
        {/* <RouteRequiresLogin path="/predictions" element={<Predictions />}>
        </RouteRequiresLogin> */}
        <Route
          path='/login'
          element={
            <LoginForm
              title="Login"
              setEmail={setEmail}
              setPassword={setPassword}
              handleAction={() => handleLogin()}
            />}
        />
      </Routes>
      <ToastContainer />
    </div>
  );
}

export default App;
