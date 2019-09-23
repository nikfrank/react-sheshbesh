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
