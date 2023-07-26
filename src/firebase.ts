import { initializeApp } from "firebase/app";
import { getAuth, signOut, signInWithEmailAndPassword } from "firebase/auth";
import {
    getFirestore,
} from "firebase/firestore"

var firebaseConfig = {
    apiKey: "AIzaSyD6paq9koUJs2eyeiuPXTZRmHwXXkGXpyk",
    authDomain: "goon-squad-d7bf3.firebaseapp.com",
    projectId: "goon-squad-d7bf3",
    storageBucket: "goon-squad-d7bf3.appspot.com",
    messagingSenderId: "968553561226",
    appId: "1:968553561226:web:af9f6d51ea66cc60548173",
    measurementId: "G-M0VVW93ZYW"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

const logInWithEmailAndPassword = async (email, password)=> {
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
        console.error(err);
        throw err;
    }
};


const logout = () => {
    signOut(auth);
};

export { db, firebaseApp, auth, logInWithEmailAndPassword, logout };
