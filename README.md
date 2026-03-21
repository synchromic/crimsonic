# crimsonic

Since early on in my osu!taiko career, I've been playing this map: [-45 - Crimsonic Dimension, mapped by Genjuro](https://osu.ppy.sh/beatmapsets/2213637#taiko/4690072). This map is almost entirely one long 152bpm deathstream. I play this every day I play taiko, near the end of my session, and I've been slowly improving. This website is a visualizer for my progress.

## Development

This project has two main components: a Python script for parsing the map and replays and precomputing statistics, and the website written in Svelte.

### Script

Use uv: in the `scripts` directory, `uv sync` to install dependencies and `uv run main.py` to run the script.

### Website

Setup: `npm install` in the root directory to setup development tools like Prettier, the code formatter. `npm install` in the `website` directory to install dependencies for the website. Before running, must generate data files using the python script.

Development: `npm run dev` in the root directory to start the Vite development server.
