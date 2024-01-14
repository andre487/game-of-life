let darkTheme = false;
try {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        darkTheme = true;
    }
} catch (e) {
    window.reportError(e);
}

let gridFill = '#616161';
let gridStroke = '#bdbdbd';
let gridBorderColor = '#fafafa';

if (darkTheme) {
    gridFill = '#bdbdbd';
    gridStroke = '#616161';
    gridBorderColor = '#000000';
}

export default {
    darkTheme,
    gridFill,
    gridStroke,
    gridBorderColor,
};
