<script lang="ts">
    import { readable, writable } from "svelte/store";
    import {
        CellState,
        hasWinner,
        type Connect4Cell,
        type Connect4Row,
    } from "./cell";
    import {
        createTable,
        Subscribe,
        Render,
        createRender,
    } from "svelte-headless-table";
    import Cell from "./Cell.svelte";
    let dataRows: Array<Connect4Row> = [];

    for (let row = 0; row < 6; row++) {
        let cells: Array<Connect4Cell> = [];

        for (let col = 0; col < 7; col++) {
            cells.push({
                state: CellState.EMPTY,
                goalState: CellState.EMPTY,
                row: row,
                col: col,
            });
        }
        dataRows.push({
            cells: cells,
        });
    }
    let currentPlayer = CellState.RED;
    const data = writable(dataRows);
    const table = createTable(data);
    let columns = [];
    for (let col = 0; col < 7; col++) {
        columns.push(
            table.column({
                header: "",
                id: "col_" + col,
                accessor: (row) => row.cells[col],
                cell: (data) =>
                    createRender(Cell, {
                        cell: data.value,
                        onclick: onUpdate,
                    }),
            })
        );
    }
    const tableColumns = table.createColumns(columns);
    const { headerRows, rows, tableAttrs, tableBodyAttrs } =
        table.createViewModel(tableColumns);
    let errorMessage: string;
    async function onUpdate(
        rowId: number,
        colId: number,
        cellValue: CellState
    ) {
        // console.log("updating cell ", rowId, colId, cellValue);

        let column = dataRows.map((row) => row.cells[colId]);
        let emptyCells = column.filter(
            (cell) => cell.state === CellState.EMPTY
        );
        if (emptyCells.length === 0) {
            errorMessage = "Could not select column as it is already full";
        } else {
            // emptyCells[emptyCells.length - 1].state = CellState.RED;
            let thisColor = currentPlayer;
            let nextColor;
            switch (currentPlayer) {
                case CellState.RED:
                    nextColor = CellState.YELLOW;
                    break;
                case CellState.YELLOW:
                    nextColor = CellState.RED;
                    break;
                default:
                    errorMessage = "Could not assign color, breaking!";
                    nextColor = CellState.EMPTY;
                    break;
            }

            $data[emptyCells.length - 1].cells[colId].goalState = thisColor;
            await checkState();
            currentPlayer = nextColor;
            $data = $data;
        }
    }
    let winnerMessage: string;
    async function checkState() {
        // we check if someone has won.
        let winner = hasWinner($data);
        if (winner != CellState.EMPTY) {
            winnerMessage = winner.toString();
        }
    }
</script>

<h1 class="text-center text-5xl">Connect Four</h1>
<div class="p-8 items-center flex flex-col">
    <table class="table w-2/3 shadow-md " {...$tableAttrs}>
        <thead>
            {#each $headerRows as headerRow (headerRow.id)}
                <Subscribe rowAttrs={headerRow.attrs()} let:rowAttrs>
                    <tr {...rowAttrs}>
                        {#each headerRow.cells as cell (cell.id)}
                            <Subscribe attrs={cell.attrs()} let:attrs>
                                <th {...attrs}>
                                    <Render of={cell.render()} />
                                </th>
                            </Subscribe>
                        {/each}
                    </tr>
                </Subscribe>
            {/each}
        </thead>
        <tbody {...$tableBodyAttrs}>
            {#each $rows as row (row.id)}
                <Subscribe rowAttrs={row.attrs()} let:rowAttrs>
                    <tr {...rowAttrs}>
                        {#each row.cells as cell (cell.id)}
                            <Subscribe attrs={cell.attrs()} let:attrs>
                                <td {...attrs} style="padding: 0.2em;">
                                    <Render of={cell.render()} />
                                </td>
                            </Subscribe>
                        {/each}
                    </tr>
                </Subscribe>
            {/each}
        </tbody>
    </table>

    {#if errorMessage}
        <div>
            <strong class="text-red-400">{errorMessage}</strong>
        </div>
    {/if}

    {#if winnerMessage}
        <strong>There's a winner! {winnerMessage}</strong>
    {/if}
</div>
