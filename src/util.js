export const initBoard = [
  2, 0, 0, 0, 0, -5,
  0, -3, 0, 0, 0, 5,
  -5, 0, 0, 0, 3, 0,
  5, 0, 0, 0, 0, -2,
];


export const calculateBoardAfterMove = (
  { chips, dice, turn, blackJail, whiteJail, blackHome, whiteHome },
  { moveFrom, moveTo, usedDie },
)=>{

  const direction = turn === 'black' ? 1 : -1;

  let nextDice = [
    ...dice.slice( 0, dice.indexOf(usedDie) ),
    ...dice.slice( dice.indexOf(usedDie) + 1)
  ];

  let nextChips = [...chips];
  let nextWhiteJail = whiteJail;
  let nextBlackJail = blackJail;
  let nextWhiteHome = whiteHome;
  let nextBlackHome = blackHome;

  if( typeof moveFrom === 'number' ) nextChips[ moveFrom ] -= direction;
  else {
    if( turn === 'black' ) nextBlackJail--;
    if( turn === 'white' ) nextWhiteJail--;
  }

  if( typeof moveTo === 'number' ){
    // if the to is a single opponent, move it to jail
    if( chips[moveTo] === -direction ){
      nextChips[moveTo] = direction;
      if( turn === 'black' ) nextWhiteJail++;
      if( turn === 'white' ) nextBlackJail++;

    } else {
      // increase a chip in the to
      nextChips[moveTo] += direction;
    }
  } else {
    // we're moving home
    if( turn === 'black' ) nextBlackHome++;
    if( turn === 'white' ) nextWhiteHome++;
  }

  return {
    dice: nextDice,
    chips: nextChips,
    turn,
    whiteJail: nextWhiteJail,
    whiteHome: nextWhiteHome,
    blackJail: nextBlackJail,
    blackHome: nextBlackHome,
  };
};




export const calculateLegalMoves = ({ chips, dice, turn, whiteJail, blackJail })=>{
  if( !dice.length ) return [];

  if( (turn === 'white') && (whiteJail > 0) ){
    // check if 23-18 are legal moves by dice
    return dice.filter(die => ( chips[ 24 - die ] <= 1 ))
               .map(die => ({ moveFrom: 'whiteJail', moveTo: 24 - die, usedDie: die }) );
    
  } else if( (turn === 'black') && (blackJail > 0) ){
    // check if 0-5 are legal moves by dice
    return dice.filter(die => ( chips[ die - 1 ] >= -1 ))
               .map(die => ({ moveFrom: 'blackJail', moveTo: die - 1, usedDie: die }) );
    
  } else {
    // for all dice we have, for all the chips we have, check if chip +/- die is legal

    const direction = turn === 'black' ? 1 : -1;

    const uniqueDice = Array.from(new Set(dice));
    
    const legalMoves = chips.reduce((moves, chip, i)=> (
      ( chip * direction <= 0 ) ? moves : [
        ...moves,
        ...uniqueDice.filter(die => (
          (chips[ i + direction * die ] * direction >= -1)
        )).map(die => ({ moveFrom: i, moveTo: i + direction * die, usedDie: die })),
      ]
    ), []);


    // if all pieces are in last 6, calculate legal home moves

    const furthestPiece = (turn === 'white') ? (
      24 - [...chips].reverse().findIndex(chip=> chip * direction > 0)
    ) : (
      24 - chips.findIndex(chip=> chip * direction > 0)
    );

    const legalHomeMoves = (
      furthestPiece > 6
    ) ? [] : (
      turn === 'white'
    ) ? [0, 1, 2, 3, 4, 5].filter(spot=> (
      (chips[spot] < 0) && (
        (uniqueDice.filter(die => die === spot+1).length) ||
        (uniqueDice.filter(die => ((die >= furthestPiece) && (spot+1 === furthestPiece))).length)
      )
    )).map(spot => ({
      moveFrom: spot,
      moveTo: 'whiteHome',
      usedDie: uniqueDice.find(die => die === spot+1) || Math.max(...uniqueDice),
    })

    ) : [23, 22, 21, 20, 19, 18].filter(spot=> (
      (chips[spot] > 0) && (
        (uniqueDice.filter(die => die === 24-spot).length) ||
        (uniqueDice.filter(die => ((die >= furthestPiece) && (24-spot === furthestPiece))).length)
      )
    )).map(spot => ({
      moveFrom: spot,
      moveTo: 'blackHome',
      usedDie: uniqueDice.find(die => die === 24-spot) || Math.max(...uniqueDice),
    }));

    return [
      ...legalMoves,
      ...legalHomeMoves,
    ];
  }
};



export const calculateBoardOutcomes = board=>{
  let outcomes = [];

  const moves = calculateLegalMoves(board);

  let options = moves.map(move => ({
    board: calculateBoardAfterMove(board, move),
    moves: [move],
  }));

  while( options.length ){
    options = options.flatMap(option=> {
      const moves = calculateLegalMoves(option.board);

      if( !moves.length ){
        outcomes.push(option);
        return [];
      }

      return moves.map(move => ({
        board: calculateBoardAfterMove(option.board, move),
        moves: [...option.moves, move],
      }));
    });
  }

  return outcomes;
};


export const cpScore = (board)=>{
  const { chips, blackJail, whiteJail } = board;

  const blackHome = 15 - blackJail - chips.reduce((blacks, chip)=>(
    blacks + (chip > 0 ? chip : 0)
  ), 0);

  const whiteHome = 15 - whiteJail - chips.reduce((whites, chip)=>(
    whites - (chip < 0 ? chip : 0)
  ), 0);

  const blackPips = chips.reduce((pips, chip, i)=>(
    pips + (chip > 0 ? chip * (24-i) * (i < 6 ? 2 : i < 12 ? 1.5 : i < 18 ? 1.25 : 1) : 0)
  ), 0);

  const whitePips = chips.reduce((pips, chip, i)=>(
    pips - (chip < 0 ? chip * (i+1) * (i > 17 ? 2 : i > 11 ? 1.5 : i > 5 ? 1.25 : 1) : 0)
  ), 0);

  const furthestBlack = chips.reduce((furthest, chip, i)=> (
    (chip > 0) && (i < furthest) ? i : furthest), blackJail ? 0 : 24
  );

  const furthestWhite = chips.reduce((furthest, chip, i)=> (
    (chip < 0) && (i > furthest) ? i : furthest), whiteJail ? 24 : 0
  );
  
  const blackVun = chips.filter((chip, i)=> (chip === 1) && (i < furthestWhite)).length;
  const whiteVun = chips.filter((chip, i)=> (chip === -1) && (i > furthestBlack)).length;

  const blackBlocks = chips.filter((chip, i)=> (chip > 1) && (i < furthestWhite)).length;
  const whiteBlocks = chips.filter((chip, i)=> (chip < -1) && (i > furthestBlack)).length;

  const blackShneid = Math.max(0, chips[0]);
  const whiteShneid = Math.min(0, chips[23]);
  
  return (
    blackHome * 15 -
    whiteHome * 15 -
    blackPips +
    whitePips -
    blackJail * 38 +
    whiteJail * 38 -
    blackVun * 10 +
    whiteVun * 10 +
    blackBlocks * 4 -
    whiteBlocks * 4 -
    blackShneid * 17 -
    whiteShneid * 17
    
  );
};
