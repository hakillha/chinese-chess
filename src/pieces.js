export const boardWidth = 9;
export const boardHeight = 10;

function inBoard([x, y]) {
  return (x >= 0 && y >= 0 && x < boardWidth && y < boardHeight)? true : false;
}

function addAvailPos(availPos, curX, curY, dirX, dirY, boardState, pieceType, curSide) {
  let paoSetup = false;
  while(inBoard([curX + dirX, curY + dirY])) {
    curX += dirX;
    curY += dirY;
    if (pieceType === "車" || pieceType === "相") {
      if (boardState[curY][curX]) {
        if (curSide !== boardState[curY][curX].side) {
          availPos.push([curX, curY]);
        }
        break;
      }
      availPos.push([curX, curY]);
    } else if (pieceType === "炮") {
      if (boardState[curY][curX] && !paoSetup) {
        paoSetup = true;
      } else if (paoSetup && boardState[curY][curX]) {
        if (curSide !== boardState[curY][curX].side) {
          availPos.push([curX, curY]);
        }
        break;
      }
      if (!paoSetup) {
        availPos.push([curX, curY]);
      }
    }
  }
}

export default class piece {
  constructor(name, position, side) {
    this.name = name;
    this.position = position;
    this.side = side;
  }

  // TODO: 拌马腿、塞象眼、飞/明将
  static calAvailPositions(curX, curY, pieceType, pieces, curSide, boardState) {
    let availPos = [];
    if (pieceType === "兵" || pieceType === "卒") {
      availPos.push([curX + 1, curY], [curX - 1, curY]);
      availPos.push(pieceType === "兵"? [curX, curY - 1] : [curX, curY + 1]);
    } else if (pieceType === "車") {
      addAvailPos(availPos, curX, curY, 0, 1, boardState, pieceType, curSide);
      addAvailPos(availPos, curX, curY, 0, -1, boardState, pieceType, curSide);
      addAvailPos(availPos, curX, curY, 1, 0, boardState, pieceType, curSide);
      addAvailPos(availPos, curX, curY, -1, 0, boardState, pieceType, curSide);
    } else if (pieceType === "炮") {
      addAvailPos(availPos, curX, curY, 0, 1, boardState, pieceType, curSide);
      addAvailPos(availPos, curX, curY, 0, -1, boardState, pieceType, curSide);
      addAvailPos(availPos, curX, curY, 1, 0, boardState, pieceType, curSide);
      addAvailPos(availPos, curX, curY, -1, 0, boardState, pieceType, curSide);
    } else if (pieceType === "马") {
      availPos.push([curX + 1, curY + 2], [curX - 1, curY + 2], [curX + 2, curY + 1], [curX - 2, curY + 1],
        [curX + 1, curY - 2], [curX - 1, curY - 2], [curX + 2, curY - 1], [curX - 2, curY - 1]);
    } else if (pieceType === "相") {
      availPos.push([curX + 2, curY + 2], [curX - 2, curY + 2], [curX + 2, curY + 2], [curX - 2, curY + 2],
        [curX + 2, curY - 2], [curX - 2, curY - 2], [curX + 2, curY - 2], [curX - 2, curY - 2]);
      availPos = availPos.filter((aP) => curSide === "red"? aP[1] >= 5 : aP[1] < 5); 
    } else if (pieceType === "士" || pieceType === "帅" || pieceType === "将") {
      if (pieceType === "帅" || pieceType === "将") {
        availPos.push([curX + 1, curY], [curX - 1, curY], [curX, curY - 1], [curX, curY + 1]);
      } else {
        availPos.push([curX + 1, curY + 1], [curX - 1, curY + 1], [curX + 1, curY - 1], [curX - 1, curY - 1]);
      }
      availPos = availPos.filter((aP) => {
        if (2 < aP[0] && aP[0] < 6) {
          return curSide === "red"? 6 < aP[1] && aP[1] < 10 : 0 <= aP[1] && aP[1] < 3;
        } else {
          return false;
        }
      });
    }

    availPos = availPos.filter((aP) => inBoard(aP));
    return availPos.filter((aP) => !boardState[aP[1]][aP[0]] || boardState[aP[1]][aP[0]].side !== curSide);
  }
}

