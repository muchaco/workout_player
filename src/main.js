// import Home from './components/home.js';
import Player from './components/player.js';
import { router } from './router.js';
import './styles/main.css';
import './styles/w3-theme.css';

const mainContainer = '#app';

router.register('/', () => {
    new Player(mainContainer).render();
});
// router.register('/', () => {
//     new Home(mainContainer).render();
// });
router.navigate(window.location.pathname + window.location.search);
