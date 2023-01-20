import type Cell from "./Cell.svelte";

export enum CellState {
    EMPTY,
    RED,
    YELLOW
}


export type Connect4Cell = {
    row: number,
    col: number,
    state: CellState
    goalState: CellState
}


export function getColor(state: CellState): string {
    console.log("checking color for cell!")

    switch (state) {
        case CellState.EMPTY:
            return 'white';
        case CellState.RED:
            return 'red';
        case CellState.YELLOW:
            return 'yellow';
    }
}

export function hasWinner(rows: Array<Connect4Row>): CellState {
    if (hasRowWinner(rows) != CellState.EMPTY) {
        return hasRowWinner(rows);
    }
    if (hasColWinner(rows) != CellState.EMPTY) {
        return hasColWinner(rows);
    }
    if (hasLeftUpRightDownWinner(rows) != CellState.EMPTY) {
        return hasLeftUpDownRightWinner(rows);
    }
    if (hasLeftDownRightUpWinner(rows) != CellState.EMPTY) {
        return hasLeftUpDownRightWinner(rows);
    } 
    
    
function hasRowWinner(rows: Array<Connect4Row>): CellState {

    let column = rows.map((row) => row.cells[0]);
    for (let row of rows) {
        for (let col = 0; col < row.cells.length; col++) {
            if (row.cells[col].state == CellState.RED) {
                return CellState.RED;
            }
        }
    }
    return CellState.EMPTY;
}
}

export type Connect4Row = {
    cells: Array<Connect4Cell>,

}
