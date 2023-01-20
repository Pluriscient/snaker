<script lang="ts">
  let games = [
    {
      title: "Snake",
      href: "/snake",
      image:
        "https://icons.iconarchive.com/icons/google/noto-emoji-animals-nature/256/22285-snake-icon.png",
    },
	{
		title: "Connect 4",
		href: "/connectfour",
		image: "/images/connect4.jpg"
	}
  ];
</script>

<div class="flex flex-row flex-wrap p-8">
  {#each games as game}
    <a href={game.href} class="card card-hover p-4 m-4 card-glass-primary">
      <header class="card-header ">
        <img src={game.image} alt="logo of game" width="300" />
      </header>
      <div class="p-4 card-footer">{game.title}</div>
    </a>
  {/each}
</div>

