Game of life
============

The Game of life implementation

Task:
>Implement Conway's Game of Life.
> Requirements:
> * Support a large universe 2<sup>64</sup>×2<sup>64</sup>. The universe is mostly empty, except for the area with the object(s) (for example, four gliders moving away from the center in opposite directions).
> * There should be a simple UI with the possibility to configure the initial state of the universe (100×100), start the algorithm, and observe the changes. There should also be a function to store/load the state to/from a persistent storage.

In current implementation the libraries was used:
 * [RequireJS](http://requirejs.org/) for create modules,
 * [setImmediate](https://github.com/YuzuJS/setImmediate) for make data handling async,
 * [JavaScript Bignum](https://github.com/jtobey/javascript-bignum) for handling the big numbers like 2<sup>64</sup>.

The visible field size changed to 60×40 as compared with task just for most users convenience.

You can play this game at [life.underlime.net](http://life.underlime.net/)
