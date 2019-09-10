import { initBoard, calculateLegalMoves } from './util';

it('moves out of jail', ()=>{
  const moves = calculateLegalMoves({
    chips: initBoard,
    dice: [2, 6],
    turn: 'white',
    whiteJail: 1,
    blackJail: 0,
  });

  expect( moves ).toHaveLength( 1 );
  expect( moves[0] ).toEqual({ moveFrom: 'whiteJail', moveTo: 22, usedDie: 2 });
});


it('no moves out of jail', ()=>{
  const moves = calculateLegalMoves({
    chips: initBoard,
    dice: [6, 6],
    turn: 'white',
    whiteJail: 1,
    blackJail: 0,
  });

  expect( moves ).toHaveLength( 0 );
});


it('moves around the board', ()=>{
  const moves = calculateLegalMoves({
    chips: initBoard,
    dice: [5, 2],
    turn: 'white',
    whiteJail: 0,
    blackJail: 0,
  });

  expect( moves ).toHaveLength( 6 );

  
  const moreMoves = calculateLegalMoves({
    chips: initBoard,
    dice: [6, 2],
    turn: 'white',
    whiteJail: 0,
    blackJail: 0,
  });

  expect( moreMoves ).toHaveLength( 7 );
});


it('captures', ()=>{

  const captureBoard = [
    2, 2, -1, -1, -2, -2,
    0, 0, 0, 0, 0, -9,
    0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 11,
  ];
  
  const moves = calculateLegalMoves({
    chips: captureBoard,
    dice: [2, 3],
    turn: 'black',
    whiteJail: 0,
    blackJail: 0,
  });

  expect( moves ).toHaveLength( 3 );
});


it('moves home', ()=>{

  const moveHomeBoard = [
    -15, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0,
    0, 0, 0, 5, 5, 5,
  ];
  
  const moves = calculateLegalMoves({
    chips: moveHomeBoard,
    dice: [6, 2],
    turn: 'black',
    whiteJail: 0,
    blackJail: 0,
  });

  expect( moves ).toHaveLength( 3 );
});




it('moves pieces out of jail', ()=>{
  
});

it('moves pieces around the board', ()=>{
  
});

it('captures enemies', ()=>{
  
});

it('moves pieces home', ()=>{
  
});
