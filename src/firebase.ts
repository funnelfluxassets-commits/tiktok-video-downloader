import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBXobgs_ddo7zPZob-ZTHTx8MRadeYGja8",
  authDomain: "tiktok-downloader-96641.firebaseapp.com",
  projectId: "tiktok-downloader-96641",
  storageBucket: "tiktok-downloader-96641.firebasestorage.app",
  messagingSenderId: "403315916509",
  appId: "1:403315916509:web:708cead98590ff5cdee534"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
