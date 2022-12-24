import React from "react";
import ReactDOM from "react-dom/client";
import './index.css';
import piece from "./pieces";
import { boardHeight, boardWidth } from "./pieces";

const iniPieces = [
  new piece("兵", [0, 6], "red"),
  new piece("兵", [2, 6], "red"),
  new piece("兵", [4, 6], "red"),
  new piece("兵", [6, 6], "red"),
  new piece("兵", [8, 6], "red"),
  new piece("炮", [1, 7], "red"),
  new piece("炮", [7, 7], "red"),
  new piece("車", [0, 9], "red"),
  new piece("車", [8, 9], "red"),
  new piece("马", [1, 9], "red"),
  new piece("马", [7, 9], "red"),
  new piece("相", [2, 9], "red"),
  new piece("相", [6, 9], "red"),
  new piece("士", [3, 9], "red"),
  new piece("士", [5, 9], "red"),
  new piece("帅", [4, 9], "red"),
  new piece("卒", [0, 3], "black"),
  new piece("卒", [2, 3], "black"),
  new piece("卒", [4, 3], "black"),
  new piece("卒", [6, 3], "black"),
  new piece("卒", [8, 3], "black"),
  new piece("炮", [1, 2], "black"),
  new piece("炮", [7, 2], "black"),
  new piece("車", [0, 0], "black"),
  new piece("車", [8, 0], "black"),
  new piece("马", [1, 0], "black"),
  new piece("马", [7, 0], "black"),
  new piece("相", [2, 0], "black"),
  new piece("相", [6, 0], "black"),
  new piece("士", [3, 0], "black"),
  new piece("士", [5, 0], "black"),
  new piece("将", [4, 0], "black"),

  // new piece("車", [4, 2], "red"),
]; 

// TODO: cancel move mode

function BoardPosition(props) {
  let button;
  if (props.piece) {
    if (props.piece.avail) {
      button = (
        <button 
          className={"square-button avail " + props.piece.side} 
          onClick={props.piece.movePiece}
        >
          {props.piece.name}
        </button>
      );
    } else {
      button = (
        <button 
          className={`square-button ${props.piece.side}` + (props.piece.side === props.curSide? " current-side" : "")}  
          onClick={props.piece.setMovingPiece}
        >
          {props.piece.name}
        </button>
      );
    }
  } else {
    button = null;
  }
  return (
    // Use the empty div to draw diagonal line
    <div className="square">
      <div></div>
      {button}
    </div>
  );
}

function BoardRow(props) {
  return (
    <div className="board-row">
      {[...Array(boardWidth).keys()].map((x) => 
        <BoardPosition 
          key={`${x}-${props.y}`} 
          position={[x, props.y]}
          piece={props.boardState[props.y][x]}
          curSide={props.curSide}
        />
      )}
    </div>
  );
}

class Game extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      pieces: iniPieces,
      movingPiecePos: null,
      redIsNext: true,
    }
  }

  setMovingPiece(position) {
    this.setState({
      movingPiecePos: position,
    });
  }

  movePiece(dstX, dstY) {
    let pieces = this.state.pieces.filter((p) => p.position[0] !== dstX || p.position[1] !== dstY); // Remove the rival piece
    pieces = pieces.map((p) => {
      if (p.position !== this.state.movingPiecePos) {
        return {...p};
      } else {
        return {...p, position: [dstX, dstY]};
      }
    });
    this.setState({
      pieces: pieces,
      movingPiecePos: null,
      redIsNext: !this.state.redIsNext,
    });
  }

  calWinner() {
    if (!this.state.pieces.find((p) => p.name === "帅")) {
      return "black";
    } else if (!this.state.pieces.find((p) => p.name === "将")) {
      return "red";
    } else {
      return null;
    }
  }

  render() {
    const boardState = [...Array(boardHeight)].map(() => Array(boardWidth).fill(null));
    const winner = this.calWinner();
    let status;
    if (winner) {
      status = <div className="game-info">Game over! The winner is {winner} player!</div>;
    } else {
      const playerText = this.state.redIsNext? <span className="red-player">Red</span> : "Black";
      status = <div className="game-info"><b>{playerText}</b> player is taking the turn.</div>;
    }

    this.state.pieces.forEach((p) => {
      const p_ = {...p}; // Supposedly positions wouldn't be mutated so shallow copy should work
      let setMovingHandler;
      const sMPhandler = (e) => {
        e.stopPropagation();
        this.setMovingPiece(p.position);
      }; 
      if (this.state.redIsNext) {
        setMovingHandler = p_.side === "red"? sMPhandler : null;
      } else {
        setMovingHandler = p_.side === "black"? sMPhandler : null;
      }
      p_.setMovingPiece = winner? null : setMovingHandler; // When game is over pass null handler to freeze the game
      boardState[p.position[1]][p.position[0]] = p_;
    });

    if (this.state.movingPiecePos) {
      const [mPPX, mPPY] = this.state.movingPiecePos;
      const availPos = piece.calAvailPositions(
        mPPX, mPPY, boardState[mPPY][mPPX].name, this.state.pieces, 
        (this.state.redIsNext? "red" : "black"), boardState
      );
      availPos.forEach((aP) => {
        // If moving piece is not null, add availability dummy piece?
        const p_ = boardState[aP[1]][aP[0]]? {...boardState[aP[1]][aP[0]]} : {};
        p_.avail = true;
        p_.movePiece = () => this.movePiece(aP[0], aP[1]);
        boardState[aP[1]][aP[0]] = p_;
      });
    }

    return (
      <div className="game">
        <div className="game-board" onClick={() => this.setState({ movingPiecePos: null, })}>
          {[...Array(boardHeight).keys()].map((y) => 
            <BoardRow 
              key={y} 
              y={y} 
              boardState={boardState}
              curSide={this.state.redIsNext? "red" : "black"}
            />
          )}
        </div>
        <div className="game-menu">
          {status}
          <br />
          <div>
            <button
              onClick={() => {
                if(window.confirm("Are you sure about resetting the game?")) {
                  this.setState({
                    pieces: iniPieces,
                    movingPiecePos: null,
                    redIsNext: true,
                  });
                }
              }}
            >
              Reset Game
            </button>
          </div>
          <br />
          <div>
            Game Manuals: <br />
            Click on the board to cancel movement if you've selected a piece to move.
          </div>
        </div>
      </div>
      
    );
  }
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />)
