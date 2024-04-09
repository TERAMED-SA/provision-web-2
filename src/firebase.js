// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyC_3JsRVuSy24_8HTGxj6d_x9oswpDXj_U",
    authDomain: "provision-414311.firebaseapp.com",
    projectId: "provision-414311",
    storageBucket: "provision-414311.appspot.com",
    messagingSenderId: "53450579468",
    appId: "1:53450579468:web:9285b788ab96141f6d5829",
    measurementId: "G-ZP4K3CLD6D"
};

// Intialize Firebase
const appFirebase = initializeApp(firebaseConfig);
const analytics = getAnalytics(appFirebase);

export { appFirebase }