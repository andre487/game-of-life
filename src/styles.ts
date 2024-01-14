let darkTheme = false;
try {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        darkTheme = true;
    }
} catch (e) {
    window.reportError(e);
}

let gridFill = '#e6e6fa';
let gridStroke = '#708090';

if (darkTheme) {
    gridFill = '#616161';
    gridStroke = '#eceff1';
}

export default {
    darkTheme,
    gridFill,
    gridStroke,
};
