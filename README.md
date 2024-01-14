Game of life
============

The Game of life implementation

Task:
>Implement Conway's Game of Life.
> Requirements:
> * Support a large universe 2<sup>64</sup>×2<sup>64</sup>. The universe is mostly empty, except for the area with the object(s) (for example, four gliders moving away from the center in opposite directions).
> * There should be a simple UI with the possibility to configure the initial state of the universe (100×100), start the algorithm, and observe the changes. There should also be a function to store/load the state to/from a persistent storage.

This task was solved, but universe size 2<sup>64</sup>×2<sup>64</sup> is very huge and it's inconvenient to use game with universe like this. So size is reduced. If you want to use 2<sup>64</sup>×2<sup>64</sup>, you han add URL parameter `huge-universe=1` to site's location, reload the page and then push "Reset" button.

You can play this game at [life.underlime.net](http://life.underlime.net/)
