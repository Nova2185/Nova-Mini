import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyAeRPodGL6KuzpdVsdv_jwhLOvbA4u-1j8",
  authDomain: "url-shortner-nova.firebaseapp.com",
  projectId: "url-shortner-nova",
  storageBucket: "url-shortner-nova.appspot.com",
  messagingSenderId: "1079042688738",
  appId: "1:1079042688738:web:d6ca211b73ac3ef0e9c0bb",
  measurementId: "G-GDZ1B56R8J"
};

initializeApp(firebaseConfig);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
