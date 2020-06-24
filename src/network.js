import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';


const fakeGames = [
  {
    players: [ '106483364296779313079', '103467006218876645081' ],
    board: {
      chips: [2,0,0,0,0,-5,0,-3,0,0,0,5,-5,0,0,0,3,0,5,0,0,0,0,-2],
      whiteHome: 0,
      whiteJail: 0,
      blackHome: 0,
      blackJail: 0,
      turn: null,
      dice: [],
    },
  },
  {
    players: [ '106483364296779313078', '103467006218876645022' ],
    board: {
      chips: [1,0,-2,0,0,-4,0,-2,0,0,0,6,-5,0,0,0,3,0,5,0,0,0,0,-2],
      whiteHome: 0,
      whiteJail: 0,
      blackHome: 0,
      blackJail: 0,
      turn: 'white',
      dice: [2, 2, 2, 2],
    },
  },
];

export const listGames = ()=> Promise.resolve(fakeGames);


const firebaseConfig = {
  apiKey: "AIzaSyDjinYKD7z3LBq4K5MuRPCdrZmnk2ldGNw",
  authDomain: "sheshbesh-82dc3.firebaseapp.com",
  databaseURL: "https://sheshbesh-82dc3.firebaseio.com",
  projectId: "sheshbesh-82dc3",
  storageBucket: "sheshbesh-82dc3.appspot.com",
  messagingSenderId: "959761569248",
  appId: "1:959761569248:web:71fd2060da779f84d68785",
  measurementId: "G-CTYFTSDRV9"
};

firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth;
export const db = firebase.firestore();

export const loginWithGithub = ()=>
  auth().signInWithPopup( new auth.GithubAuthProvider() );
