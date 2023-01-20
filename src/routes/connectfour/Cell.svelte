<script lang="ts">
    import { getColor, type Connect4Cell } from "./cell";
    import { fade, fly } from "svelte/transition";
    import { CellState } from "./cell";
    export let cell: Connect4Cell;
    export let onclick;
    const transitionDuration = 500;
    // $: color = getColor(cell.state);

    const handleInteraction = () => {
        console.log("Clicked on cell", cell);
        onclick(cell.row, cell.col, cell.state);
        console.log("Finished");
    };

    let states = [0, 1, 2];
</script>

<!-- {JSON.stringify(states)} -->
<div
    class="w-full aspect-square "
    on:keypress={handleInteraction}
    on:click={handleInteraction}
>
    <div class="relative">
        <div
            class="inset-0  rounded-full w-full aspect-square"
            style="background-color: {getColor(CellState.EMPTY)};"
        />
        {#each states as state}
            {#if state == cell.state}
                {#if cell.state == cell.goalState}
                    <div
                        class="absolute inset-0 w-full animated-change p-2 rounded-full aspect-square "
                        style="background-color: {getColor(state)}"
                        out:fade={{ delay: 0, duration: transitionDuration }}
                        in:fly={{
                            delay: 0,
                            duration: transitionDuration,
                            y: -500,
                        }}
                        on:outroend={() => (cell.state = cell.goalState)}
                    />
                {/if}
            {/if}
        {/each}
    </div>

    <!-- {color} -->
</div>

<style>
    .animated-change {
        transition-property: "background-color";
        transition-duration: 500ms;
    }
</style>
